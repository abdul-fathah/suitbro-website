# 03 — Development

## Requirements

Node 18 or newer. Nothing else — there are no dependencies to install.

```bash
node --version
```

## Start working

```bash
npm run dev
```

That builds the development environment and serves it. Open
<http://localhost:3000>.

You will see a gold **DEV** pill in the bottom-left corner, and red or gold
badges wherever content is still invented or unverified. Neither appears in
production.

To use a different port:

```bash
PORT=8080 npm run dev
```

## The loop

`public/` is the source. `dist/development/` is generated output — **never
edit anything in `dist/`**, it is deleted and rewritten on every build.

1. Edit a file in `public/`
2. Re-run `npm run dev`
3. Refresh the browser

There is no watcher. The build takes well under a second, so re-running it is
faster than setting one up.

## Every command

| Command | Does |
|---|---|
| `npm run dev` | Build development, then serve it |
| `npm run build:dev` | Build development only |
| `npm run build:staging` | Build staging |
| `npm run build:prod` | Build production |
| `npm run build:all` | Build all three |
| `npm run serve:dev` | Serve an existing development build |
| `npm run serve:staging` | Serve the staging build locally |
| `npm run serve:prod` | Serve the production build locally |
| `npm run check` | Verify the production build is safe to ship |
| `npm run check -- staging` | Verify a different environment |
| `npm start` | Build production and serve it (this is what Railway runs) |

## Seeing production exactly as visitors will

```bash
npm run build:prod && npm run serve:prod
```

No badge, no placeholder markers, real canonical URLs. This is the honest
preview — use it before every release.

## Common jobs

**Change wording.** Edit the relevant `public/*.html`. Every page is plain
HTML; the copy is not hidden behind anything.

**Change a colour or a font.** The tokens at the top of `public/styles.css`.
`--gold` alone controls every accent on the site.

**Add a page.** Copy an existing page, then add the link to the `<nav>` **and**
the footer nav in all seven files. Add it to `public/sitemap.xml` too.

**Add a photograph.** Put it in `public/images/`, then reference it. For
anything large, also produce 480px and 900px variants and wire up `srcset` —
see how the existing images do it. A phone should never download a 1500px file
for a 350px slot.

**Replace invented content.** Search for `PLACEHOLDER` across `public/`. Each
one marks something made up. Delete the comment when you replace the content —
that is what removes the badge and clears the production warning.

```bash
grep -rn "PLACEHOLDER\|VERIFY" public/
```

## Before you commit

```bash
npm run build:all && npm run check
```

If `check` fails, the release is not safe. It will say exactly what is wrong.
