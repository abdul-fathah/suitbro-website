# 04 — Deployment

## Branch model

| Branch | Environment | Deploys to |
|---|---|---|
| `develop` | development | nowhere — local only |
| `staging` | staging | the staging host |
| `main` | production | the live site |

Work on `develop`, merge to `staging` to preview, merge to `main` to release.
Only `main` is public.

> As of now only `main` exists. Create the other two when you want the
> workflow: `git checkout -b develop main && git push -u origin develop`.

## Vercel — recommended

Everything served is a static file, so Vercel gives a global CDN, free
automatic HTTPS, and nothing to keep running. `vercel.json` is committed and
already correct: it runs the production build and serves `dist/production`.

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo
2. It reads `vercel.json`; no settings to change
3. **Settings → Domains** → add the domain, then create the DNS records shown

For staging, create a **second Vercel project** from the same repo, set its
production branch to `staging`, and override the build command to
`node scripts/build.js staging`.

## Railway — if you self-host video

`server.js` does two things static hosting cannot: HTTP Range streaming, so
video can seek, and a homepage fallback on unknown URLs. If you add a
self-hosted video file, use Railway.

1. [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo**
2. No environment variables needed — the server reads Railway's `PORT`
3. **Settings → Networking → Generate Domain** — until you click this, there
   is no public URL at all, and the deploy will look broken when it is not

`npm start` builds production and then serves it, so Railway gets a correct
production build on every deploy.

## Custom domain

The site is wired for `suitbro.ae`. After buying it:

1. Add the domain in Vercel (or Railway)
2. Create the DNS records it shows you
3. **The apex needs ALIAS or ANAME, not CNAME.** A plain CNAME is not valid at
   the apex. If your registrar offers neither, serve the site on
   `www.suitbro.ae` and redirect the apex to it.

Pick one hostname and redirect the other. Serving the same pages on both the
apex and `www` splits your search ranking between two addresses. The canonical
tags name the bare apex, so redirect `www` → apex.

To change the domain, edit `baseUrl` in `config/production.json`. Nothing else
references it.

## Release checklist

```bash
npm run build:prod
npm run check          # must exit 0
npm run serve:prod     # look at it as a visitor would
```

Then merge to `main`. The host rebuilds automatically.

**Do not release while `check` reports the placeholder warning** unless you
have decided deliberately that invented content can go live.
