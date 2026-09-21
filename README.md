# Suit Bro — suitbro-website

Personal site for **Abdul Fatah**, real estate agent, Dubai / UAE.

Static HTML, black + gold, zero build step. Served by a dependency-free Node
server so it deploys anywhere that runs Node.

---

## Run it locally

```bash
npm start
```

Then open <http://localhost:3000>. There is nothing to install first — the
server uses only Node's built-in modules. Node 18 or newer.

To use a different port:

```bash
PORT=8080 npm start
```

---

## What's where

```
.
├── public/                 ← everything user-facing
│   ├── index.html          ← Home
│   ├── about.html          ← About
│   ├── listings.html       ← Listings
│   ├── track-record.html   ← Track Record
│   ├── market-insights.html← Market Insights
│   ├── clients.html        ← Clients
│   ├── contact.html        ← Contact
│   └── styles.css          ← the single shared stylesheet
├── server.js               ← static file server (no dependencies)
├── package.json            ← start script + Node version
├── railway.json            ← Railway build/deploy config
├── PROJECT.md              ← living project doc: brand, status, what's still needed
└── README.md               ← this file
```

Every page is plain, standalone HTML. There is no templating and no build
step, which means **you can edit any page directly on GitHub** and it goes
live — see the workflow below.

---

## Deploying to Railway

One-time setup:

1. [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo**
2. Authorise GitHub and pick `suitbro-website`
3. It builds and starts automatically. **No environment variables needed** —
   the server reads Railway's assigned `PORT` on its own.
4. **Settings → Networking → Generate Domain** to get the live URL

## Making changes after that

1. Open the file you want to change on GitHub
2. Click the pencil icon, make the edit, **Commit changes**
3. Railway redeploys within about a minute

Each commit is a checkpoint you can roll back to from GitHub's history.

---

## Custom domain — suitbro.ae

The site is wired for `https://suitbro.ae`: every page carries a `<link rel="canonical">`
and Open Graph `og:url`, and `public/sitemap.xml` + `public/robots.txt` point there.

To connect it after buying the domain:

1. **Railway** → your service → **Settings → Networking → Custom Domain**
2. Enter `suitbro.ae`. Railway shows you a DNS target (something like
   `xxxx.up.railway.app`).
3. **At your registrar's DNS panel**, add the record Railway asks for:
   - `www` → **CNAME** → the Railway target
   - the apex (`suitbro.ae`, sometimes written `@`) → **ALIAS**/**ANAME**, or the
     **A** record Railway gives you. A plain CNAME is not valid at the apex, so if
     your registrar offers neither ALIAS nor ANAME, put the site on `www.suitbro.ae`
     and redirect the apex to it.
4. Wait for DNS to propagate (minutes to a few hours) — Railway issues the TLS
   certificate automatically once it resolves.

**If you change the domain**, the URL appears in four places: the `<link rel="canonical">`
and `og:url` tags in each of the seven pages, plus `sitemap.xml` and `robots.txt`.
Search and replace `https://suitbro.ae` across `public/`.

**Pick one hostname and stick to it.** Serving the same pages on both `suitbro.ae` and
`www.suitbro.ae` splits your search ranking between two addresses. The canonical tags
currently name the bare `suitbro.ae`, so redirect `www` to it rather than serving both.

---

## Editing notes

**The navigation is repeated in every file.** If you add or rename a page you
have to update the `<nav class="nav">` block *and* the footer nav in all seven
files. That is the trade-off for having no build step.

**Look for `<!-- PLACEHOLDER: ... -->` comments.** They mark every piece of
invented content that needs replacing before the site goes properly live —
stats, bio, testimonials, the track-record table and the portrait blocks.
`<!-- VERIFY: ... -->` marks the two listing taglines that were reconstructed
from a cropped screenshot.

**Video is supported.** Drop an `.mp4` (or `.webm`) into `public/images/` — or a
`public/video/` folder — and reference it from a `<video>` tag. The server sends
the right content type, streams the file rather than loading it into memory, and
honours Range requests so seeking works. Keep a background loop under about 10MB:
muted, no audio track, H.264 MP4 for universal support.

**Colours and type live at the top of `public/styles.css`** as CSS custom
properties. Change `--gold` in one place and it changes everywhere.

**The contact form does not send anything yet.** It validates and shows a
confirmation that tells the visitor to call instead. To make it deliver, point
the `<form>` at a [Formspree](https://formspree.io) endpoint and delete the
inline `<script>` at the bottom of `contact.html`.

See `PROJECT.md` for the full status of what is real and what is still
placeholder.
