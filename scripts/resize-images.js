#!/usr/bin/env node
/**
 * Generate the 480w and 900w variants that srcset expects.
 *
 *   node scripts/resize-images.js
 *
 * Scans public/images (including listings/) for full-size .jpg files with no
 * variants yet, and writes them. Already-generated files are skipped, so it is
 * safe to re-run after adding one photo.
 *
 * Uses the headless browser already installed for testing, so there is still
 * no npm dependency.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Playwright is optional and usually installed globally rather than in this
// project, so try the common global locations before giving up.
let chromium;
const candidates = [
  'playwright',
  '/opt/node22/lib/node_modules/playwright',
  '/usr/lib/node_modules/playwright',
  '/usr/local/lib/node_modules/playwright',
];
for (const c of candidates) {
  try { ({ chromium } = require(c)); break; } catch (e) { /* try the next one */ }
}
if (!chromium) {
  console.error('Playwright is not installed, so this script cannot resize anything.');
  console.error('');
  console.error('That is fine — it is only a convenience. Resize with any tool you like.');
  console.error('The only requirement is that alongside  photo.jpg  you end up with:');
  console.error('   photo-480.jpg   (480px wide)');
  console.error('   photo-900.jpg   (900px wide)');
  console.error('');
  console.error('Preview on a Mac, Photos on Windows, or any online resizer will do it.');
  process.exit(1);
}

const DIRS = [
  path.join(__dirname, '..', 'public', 'images'),
  path.join(__dirname, '..', 'public', 'images', 'listings'),
];

(async () => {
  const jobs = [];
  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/\.jpe?g$/i.test(f) || /-\d+\.jpe?g$/i.test(f)) continue;
      for (const w of [480, 900]) {
        const out = f.replace(/\.jpe?g$/i, `-${w}.jpg`);
        if (!fs.existsSync(path.join(dir, out))) jobs.push({ dir, src: f, out, w });
      }
    }
  }

  if (!jobs.length) { console.log('Nothing to do — every image already has its variants.'); return; }

  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<canvas id="c"></canvas>');
  let made = 0;

  for (const j of jobs) {
    const buf = fs.readFileSync(path.join(j.dir, j.src));
    const dataUrl = 'data:image/jpeg;base64,' + buf.toString('base64');
    const res = await p.evaluate(async ({ dataUrl, w }) => {
      const img = new Image();
      await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = dataUrl; });
      if (img.naturalWidth <= w) return null;          // never upscale
      const s = w / img.naturalWidth;
      const cw = Math.round(img.naturalWidth * s), ch = Math.round(img.naturalHeight * s);
      const c = document.getElementById('c');
      c.width = cw; c.height = ch;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, cw, ch);
      return { data: c.toDataURL('image/jpeg', 0.8), w: cw, h: ch };
    }, { dataUrl, w: j.w });

    if (!res) { console.log(`skip  ${j.out}  (source is not wider than ${j.w}px)`); continue; }
    const bytes = Buffer.from(res.data.split(',')[1], 'base64');
    fs.writeFileSync(path.join(j.dir, j.out), bytes);
    console.log(`write ${j.out.padEnd(30)} ${res.w}x${res.h}  ${(bytes.length / 1024).toFixed(0)}KB`);
    made++;
  }

  await b.close();
  console.log(`\n${made} variant(s) written.`);
})();
