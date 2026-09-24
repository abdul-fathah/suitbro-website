#!/usr/bin/env node
/**
 * Verify a built environment is internally consistent and safe to ship.
 *
 *   node scripts/check.js                 # checks production
 *   node scripts/check.js development
 *
 * Exits non-zero on failure, so it can gate a release.
 *
 * The check that matters most: a production build must contain no visible
 * PLACEHOLDER or VERIFY markers. Those mark invented or unverified content,
 * and this site has a lot of it.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const env = process.argv[2] || 'production';
const cfgPath = path.join(ROOT, 'config', env + '.json');

if (!fs.existsSync(cfgPath)) {
  console.error(`No such environment: ${env}`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const DIR = path.join(ROOT, 'dist', cfg.name);

if (!fs.existsSync(DIR)) {
  console.error(`Not built yet: dist/${cfg.name}\nRun:  node scripts/build.js ${cfg.name}`);
  process.exit(1);
}

const fail = [];
const warn = [];
const pass = [];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk(DIR);
const pages = files.filter(f => f.endsWith('.html'));
const rel = f => path.relative(DIR, f);

/* --- 1. invented content must not reach an indexable environment --------- */
let notes = 0;
for (const p of pages) {
  const c = fs.readFileSync(p, 'utf8');
  const n = (c.match(/class="dev-note"/g) || []).length;
  notes += n;
  if (n && cfg.indexable) fail.push(`${rel(p)}: ${n} PLACEHOLDER/VERIFY marker(s) visible in an indexable build`);
}
if (cfg.indexable && notes === 0) pass.push('no placeholder markers in an indexable build');
if (!cfg.indexable) pass.push(`${notes} placeholder marker(s) surfaced (expected for ${cfg.name})`);

/* --- 2. search-engine posture matches the config ------------------------- */
const robots = fs.readFileSync(path.join(DIR, 'robots.txt'), 'utf8');
const disallowAll = /^\s*Disallow:\s*\/\s*$/m.test(robots);
if (cfg.indexable && disallowAll) fail.push('robots.txt disallows everything in an indexable environment');
if (!cfg.indexable && !disallowAll) fail.push(`robots.txt does not disallow crawling — ${cfg.name} would be indexed`);
if (!fail.some(f => f.startsWith('robots'))) pass.push(`robots.txt correct for indexable=${cfg.indexable}`);

for (const p of pages) {
  const c = fs.readFileSync(p, 'utf8');
  const hasNoindex = /name="robots"[^>]*noindex/.test(c);
  if (!cfg.indexable && !hasNoindex) fail.push(`${rel(p)}: missing noindex meta`);
  if (cfg.indexable && hasNoindex) fail.push(`${rel(p)}: has a noindex meta in production`);
}

/* --- 3. every canonical points at this environment ----------------------- */
const otherHosts = new Set();
for (const p of pages) {
  const c = fs.readFileSync(p, 'utf8');
  for (const m of c.matchAll(/(?:rel="canonical"\s+href|property="og:url"\s+content)="([^"]+)"/g)) {
    if (!m[1].startsWith(cfg.baseUrl)) otherHosts.add(`${rel(p)} -> ${m[1]}`);
  }
}
if (otherHosts.size) fail.push(...[...otherHosts].map(h => `canonical/og:url on the wrong host: ${h}`));
else pass.push(`all canonical and og:url values on ${cfg.baseUrl}`);

/* --- 4. no local asset 404s --------------------------------------------- */
const present = new Set(files.map(f => rel(f).split(path.sep).join('/')));
const missing = new Set();
for (const p of pages) {
  const c = fs.readFileSync(p, 'utf8');
  const refs = [
    ...[...c.matchAll(/(?:src|href)="([^"#?:]+\.(?:css|js|jpg|jpeg|png|webp|svg|ico|mp4|webm))"/g)].map(m => m[1]),
    ...[...c.matchAll(/srcset="([^"]+)"/g)].flatMap(m =>
      m[1].split(',').map(s => s.trim().split(/\s+/)[0])),
  ];
  for (const r of refs) if (!present.has(r)) missing.add(`${rel(p)} -> ${r}`);
}
if (missing.size) fail.push(...[...missing].map(m => `missing asset: ${m}`));
else pass.push('every referenced local asset exists');

/* --- 5. sitemap agrees with the environment ----------------------------- */
const smPath = path.join(DIR, 'sitemap.xml');
if (fs.existsSync(smPath)) {
  const sm = fs.readFileSync(smPath, 'utf8');
  const bad = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => !u.startsWith(cfg.baseUrl));
  if (bad.length) fail.push(`sitemap.xml has ${bad.length} URL(s) on the wrong host (e.g. ${bad[0]})`);
  else pass.push(`sitemap.xml: ${(sm.match(/<loc>/g) || []).length} URLs, all on ${cfg.baseUrl}`);
}

/* --- 6. content still flagged as invented ------------------------------- */
if (cfg.indexable) {
  const src = walk(path.join(ROOT, 'public')).filter(f => f.endsWith('.html'));
  let raw = 0;
  for (const p of src) raw += (fs.readFileSync(p, 'utf8').match(/<!--\s*(PLACEHOLDER|VERIFY):/g) || []).length;
  if (raw) warn.push(`${raw} PLACEHOLDER/VERIFY marker(s) still in public/ — invented or unverified content is about to go live`);
}

/* ----------------------------------------------------------------- report */
console.log(`\ncheck: ${cfg.name}  (dist/${cfg.name})\n`);
pass.forEach(p => console.log(`  PASS  ${p}`));
warn.forEach(w => console.log(`  WARN  ${w}`));
fail.forEach(f => console.log(`  FAIL  ${f}`));
console.log(`\n${pass.length} passed, ${warn.length} warning(s), ${fail.length} failure(s)\n`);
process.exit(fail.length ? 1 : 0);
