# 01 — Architecture

## The shape of it

A static website with a small Node server in front of it. No framework, no npm
dependencies, no bundler.

```
public/              the site, and the only place you edit
  *.html             one file per page, seven in total
  styles.css         one stylesheet, shared by every page
  images/            photography, at three widths each
  robots.txt         replaced per environment at build time
  sitemap.xml

config/              one file per environment
scripts/
  build.js           public/ + config -> dist/<environment>/
  check.js           verifies a build is safe to ship
dist/                generated output. Never edited, never committed.
server.js            static file server
docs/                this documentation
```

## Why it is built this way

**`public/` is the source of truth and stays directly editable.** Every page is
plain, standalone HTML. You can open one in GitHub's web editor, change a
sentence, commit, and it deploys. No build knowledge required for everyday
copy changes.

The cost of that choice: the navigation and footer are duplicated in all seven
files. Adding or renaming a page means editing all seven. That is a deliberate
trade — it keeps the common case (change some words) easy, at the expense of
the rare case (change the site structure).

**The build only applies environment differences.** It does not compile,
bundle, or minify. It copies `public/` and then changes the handful of things
that genuinely differ between environments — the hostname, the robots policy,
and some safety rails. If the build ever disappeared, `public/` would still be
a working website.

**The server has no dependencies.** Node's built-in `http` module only. It
streams files rather than reading them into memory, and honours HTTP Range
requests so video can seek.

## The stylesheet

One file, `public/styles.css`, roughly in this order:

1. **Tokens** — colour, type, spacing, radii as CSS custom properties. Change
   `--gold` in one place and it changes everywhere.
2. **Base** — typography, links, focus states.
3. **Components** — nav, buttons, cards, listings, tables, forms, photos.
4. **Liquid glass** — translucent panels, plus the ambient `.orb` gradients
   that give the blur something to refract.
5. **Motion** — scroll reveals and the landing-page intro.
6. **Responsive** — breakpoints at 1000px, 800px, 640px and 560px.

Anything inside `@media (prefers-reduced-motion: reduce)` exists so the site
stays usable for people who ask for less animation. Do not remove it.
