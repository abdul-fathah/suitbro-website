#!/usr/bin/env node
/**
 * Build one environment from public/ into dist/<env>/.
 *
 *   node scripts/build.js development
 *   node scripts/build.js staging
 *   node scripts/build.js production
 *
 * public/ stays the single source of truth and remains directly editable —
 * including through GitHub's web editor. This script only applies the
 * differences between environments:
 *
 *   - rewrites the canonical host (canonical, og:url, sitemap, robots)
 *   - writes robots.txt to match whether the environment may be indexed,
 *     and adds a noindex meta tag to every page when it may not
 *   - shows a corner badge on non-production builds, so nobody mistakes
 *     staging for the live site
 *   - turns PLACEHOLDER / VERIFY comments into visible on-page badges,
 *     so invented content cannot quietly reach production
 *
 * Zero dependencies, same as the server.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public');
const PROD_HOST = 'https://suitbro.ae';

const env = process.argv[2];
if (!env) {
  console.error('usage: node scripts/build.js <development|staging|production>');
  process.exit(1);
}

const cfgPath = path.join(ROOT, 'config', env + '.json');
if (!fs.existsSync(cfgPath)) {
  console.error(`No such environment: ${env}\nExpected ${path.relative(ROOT, cfgPath)}`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const OUT = path.join(ROOT, 'dist', cfg.name);

/* ----------------------------------------------------------------- utils -- */

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* ------------------------------------------------------------ transforms -- */

const BANNER_CSS = `
/* Injected for non-production builds only. */
.env-badge{position:fixed;left:14px;bottom:14px;z-index:300;display:flex;align-items:center;gap:8px;
  padding:8px 14px;border-radius:100px;font-family:inherit;font-size:.66rem;font-weight:700;
  letter-spacing:.18em;text-transform:uppercase;color:#000;background:#FFA800;
  box-shadow:0 6px 24px rgba(0,0,0,.55);pointer-events:none}
.env-badge i{width:7px;height:7px;border-radius:50%;background:#000;opacity:.55}
@media (max-width:640px){.env-badge{left:10px;bottom:10px;padding:6px 11px;font-size:.6rem}}

/* PLACEHOLDER / VERIFY markers, surfaced so invented content is impossible to miss. */
.dev-note{display:inline-block;margin:.35rem .4rem .35rem 0;padding:4px 10px;border-radius:3px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.66rem;font-weight:600;
  letter-spacing:.04em;line-height:1.45;vertical-align:middle;white-space:normal;max-width:min(52ch,100%)}
.dev-note[data-kind="placeholder"]{background:rgba(255,80,80,.16);color:#ff9d9d;border:1px dashed rgba(255,80,80,.55)}
.dev-note[data-kind="verify"]{background:rgba(255,168,0,.14);color:#ffc24d;border:1px dashed rgba(255,168,0,.5)}
`;

function bannerHtml() {
  return `<div class="env-badge" aria-hidden="true"><i></i>${cfg.label}</div>\n`;
}

function transformHtml(html) {
  // 1. canonical host
  html = html.split(PROD_HOST).join(cfg.baseUrl);

  // 2. keep non-public environments out of search results
  if (!cfg.indexable && !/name="robots"/.test(html)) {
    html = html.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
  }

  // 3. environment stylesheet
  if (cfg.showBanner || cfg.showAnnotations) {
    html = html.replace('</head>', '<link rel="stylesheet" href="env.css">\n</head>');
  }

  // 4. surface the markers that flag invented or unverified content
  if (cfg.showAnnotations) {
    html = html.replace(/<!--\s*(PLACEHOLDER|VERIFY):\s*([\s\S]*?)-->/g, (_, kind, text) => {
      const clean = text.replace(/\s+/g, ' ').trim()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<span class="dev-note" data-kind="${kind.toLowerCase()}">${kind}: ${clean}</span>`;
    });
  }

  // 5. the badge, last thing before </body>
  if (cfg.showBanner) {
    html = html.replace('</body>', bannerHtml() + '</body>');
  }

  return html;
}

function robotsTxt() {
  if (!cfg.indexable) {
    return `# ${cfg.name} — deliberately excluded from search engines.\n` +
           `User-agent: *\nDisallow: /\n`;
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${cfg.baseUrl}/sitemap.xml\n`;
}

/* ------------------------------------------------------------------ main -- */

rmrf(OUT);
copyDir(SRC, OUT);

let html = 0, other = 0, notes = 0;
for (const file of walk(OUT)) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.html') {
    const before = fs.readFileSync(file, 'utf8');
    const after = transformHtml(before);
    notes += (after.match(/class="dev-note"/g) || []).length;
    fs.writeFileSync(file, after);
    html++;
  } else if (ext === '.xml' || ext === '.txt') {
    const before = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, before.split(PROD_HOST).join(cfg.baseUrl));
    other++;
  }
}

fs.writeFileSync(path.join(OUT, 'robots.txt'), robotsTxt());
if (cfg.showBanner || cfg.showAnnotations) {
  fs.writeFileSync(path.join(OUT, 'env.css'), BANNER_CSS.trimStart());
}
fs.writeFileSync(path.join(OUT, 'build-info.json'), JSON.stringify({
  environment: cfg.name,
  baseUrl: cfg.baseUrl,
  indexable: cfg.indexable,
  builtAt: new Date().toISOString(),
}, null, 2) + '\n');

const rel = path.relative(ROOT, OUT);
console.log(`built ${cfg.name} -> ${rel}/`);
console.log(`  base URL       ${cfg.baseUrl}`);
console.log(`  indexable      ${cfg.indexable}${cfg.indexable ? '' : '  (robots.txt disallows all + noindex meta)'}`);
console.log(`  pages          ${html} html, ${other} xml/txt rewritten`);
if (cfg.showAnnotations) console.log(`  annotations    ${notes} PLACEHOLDER/VERIFY markers made visible`);
if (cfg.showBanner) console.log(`  badge          "${cfg.label}" shown bottom-left`);
