# 02 — Environments

Three environments, built from the same source. One config file each, in
`config/`.

| | development | staging | production |
|---|---|---|---|
| Purpose | Your machine, while working | Shared review before release | The live public site |
| Base URL | `http://localhost:3000` | `https://staging.suitbro.ae` | `https://suitbro.ae` |
| Indexed by Google | **No** | **No** | Yes |
| `robots.txt` | `Disallow: /` | `Disallow: /` | `Allow: /` |
| `noindex` meta tag | Yes | Yes | No |
| Corner badge | `DEV` | `STAGING` | none |
| Placeholder markers visible | Yes | Yes | **No** |
| Build | `npm run build:dev` | `npm run build:staging` | `npm run build:prod` |
| Output | `dist/development/` | `dist/staging/` | `dist/production/` |

## What the build actually changes

Everything else is identical. `scripts/build.js` copies `public/` and applies
exactly five differences:

1. **Hostname.** The 22 hardcoded `https://suitbro.ae` references — canonical
   tags, `og:url`, the sitemap — become the environment's base URL.
2. **`robots.txt`.** Written from scratch to match `indexable`.
3. **`noindex` meta tag.** Added to every page when the environment must not
   be indexed. Belt and braces: `robots.txt` is a request, a `noindex` tag is
   an instruction.
4. **Corner badge.** A small `DEV` or `STAGING` pill, bottom-left, so nobody
   mistakes a preview for the live site.
5. **Placeholder markers.** `<!-- PLACEHOLDER: -->` and `<!-- VERIFY: -->`
   comments become visible on-page badges — red for placeholder, gold for
   verify.

## Why staging must not be indexed

Two copies of the same site in Google's index compete with each other, and the
staging copy can outrank the real one. Worse here specifically: this site
still carries invented testimonials and fabricated deal figures. A staging URL
that gets indexed makes that content publicly attributable.

Both `robots.txt` and the `noindex` tag are set, and `scripts/check.js` fails
the build if either is wrong.

## The release gate

```bash
npm run build:prod && npm run check
```

`check.js` exits non-zero if anything is inconsistent. It verifies:

- no visible placeholder markers in an indexable build
- `robots.txt` matches the environment's indexable setting
- `noindex` present exactly when it should be
- every canonical and `og:url` on the right host
- every referenced local asset actually exists (no 404s)
- the sitemap agrees with the environment

It also **warns** — without failing — when `public/` still contains
`PLACEHOLDER` or `VERIFY` comments while building production. That warning is
the last thing standing between invented content and a live website.

## Changing an environment

Edit its file in `config/`. To point staging somewhere else, change one line:

```json
{ "baseUrl": "https://suitbro-staging.vercel.app" }
```

Then rebuild. Nothing else needs touching.
