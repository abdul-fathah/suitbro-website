# Suit Bro — Website Project Doc

Personal site for **Abdul Fatah**, real estate agent, Dubai/UAE.
Living document — brand decisions, structure, deployment, and what's real vs. placeholder.

Last updated: **12 Sep 2026**

---

## Brand

**Name:** Abdul Fatah
**Tag/Brand:** Suit Bro *(corrected from "Suited Bro")*
**Market:** Dubai, UAE — all areas
**Tone:** Sharp, confident, personable. "Tailored" as a running metaphor — precision, fit, no wasted time.

### Colors — black + gold

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#000000` | Primary background — dominant across the whole site |
| `--ink-2` | `#0D0C09` | Alternate section background (warm near-black), for rhythm between sections |
| `--ink-3` | `#141414` | Raised surfaces — cards, portrait block |
| `--text` | `#F2F0EA` | Primary text on black |
| `--gold` | `#FFA800` | Primary accent — CTAs, prices, stat numbers, active nav, hairlines |
| `--gold-light` | `#FFC24D` | Hover states, muted gold labels |

Source: user-selected palette (coolors.co/000000-ffa800).

**Design direction:** black-dominant canvas throughout — no white or cream section backgrounds. Gold is the single recurring accent. Sections alternate between pure black and warm near-black for quiet rhythm. Generous padding and negative space kept deliberately sparse rather than dense: the "premium minimalist" read.

### Type

- **Display:** Fraunces (serif) — H1/H2, prices, stat numbers
- **Body/UI:** Manrope — body copy, nav, data tables

Manrope replaced IBM Plex Sans in Sep 2026. It carries weights 300–800, which the
fine label/heading hierarchy leans on, has strong numerals for the DLD tables, and
reads contemporary without being Inter (the safe default) or Space Grotesk (the
overused one).

Both loaded from Google Fonts, with system-serif and system-sans fallbacks.

---

## Site Structure

Multi-page. One HTML file per nav item, all sharing a single `styles.css`.

| Page | File | Contents |
|---|---|---|
| Home | `index.html` | Hero, "how I work" pillars, snapshot stats, featured listings, CTA |
| About | `about.html` | Bio, stats, credentials |
| Listings | `listings.html` | Current inventory |
| Track Record | `track-record.html` | Closed deals ledger, buyer/seller approach |
| Market Insights | `market-insights.html` | Live Dubai market data |
| Clients | `clients.html` | Testimonials, who I work with |
| Contact | `contact.html` | Form + direct contact info |

An intro plays on the landing page only: the name **Abdul Fathah** set in Fraunces,
letters rising in sequence over a warm glow, held for a beat, then lifted away —
about 2.7 seconds end to end. It plays on every load of the landing page, can be
dismissed early with a tap, key or scroll, is skipped entirely under
`prefers-reduced-motion`, and is added by script — so it can never trap a visitor
without JavaScript.

Nav sits at the top of every page, current page highlighted in gold. "Book a call" (hero + contact) links to `tel:+971557726097`.

**No build step by design.** Every page is standalone HTML so any file can be edited directly in GitHub's web editor and pushed live. The cost of that choice: the nav and footer are duplicated in all seven files, so adding or renaming a page means editing all seven.

---

## Technical Setup

```
.
├── public/               ← all pages + styles.css (everything user-facing)
│   ├── index.html
│   ├── about.html
│   ├── listings.html
│   ├── track-record.html
│   ├── market-insights.html
│   ├── clients.html
│   ├── contact.html
│   └── styles.css
├── server.js             ← dependency-free Node static server
├── package.json          ← start script + Node version
├── railway.json          ← Railway build/deploy config
├── .gitignore
├── README.md             ← deploy + editing instructions
└── PROJECT.md            ← this file
```

**Server:** plain Node `http` module, zero npm dependencies. Nothing to install, nothing to break on build. Reads `process.env.PORT` so Railway's assigned port works automatically. Extension-less URLs resolve (`/about` → `about.html`); unmatched routes fall back to the homepage; path traversal is rejected.

**Tested:** all 7 pages return 200, `styles.css` serves as `text/css`, extension-less routes resolve, unknown routes fall back to the homepage, `../` traversal is blocked, non-GET returns 405.

---

## Deployment

**Target:** GitHub (version control + checkpoints) → Railway (hosting, auto-deploys on push)

### One-time setup

**Railway**
1. railway.com → **New Project** → **Deploy from GitHub repo**
2. Authorize GitHub, select `suitbro-website`
3. Builds automatically. No environment variables needed.
4. **Settings → Networking → Generate Domain** for the live URL

### Ongoing workflow (the important part)

Every future change follows the same loop, no terminal required:

1. Open the file on GitHub → pencil icon → edit → **Commit changes**
2. Railway redeploys within a minute, automatically

Each commit is a checkpoint you can roll back to from GitHub's history.

---

## Content Status

Placeholders are marked in the HTML source with `<!-- PLACEHOLDER: ... -->`
comments, and reconstructed copy with `<!-- VERIFY: ... -->`. Search for those
strings to find everything that still needs a real answer.

| Section | Status | Notes |
|---|---|---|
| Hero copy | Placeholder | Written in the intended voice — needs your check |
| About bio | Placeholder | Career background and RERA number still needed; brokerage now named |
| About stats | Placeholder | Deals / transaction value / years — swap for real figures |
| Portrait photo | **Real** | Two office portraits supplied Sep 2026 — home and About |
| Event / awards photography | **Real** | Eight images across Home, About, Track Record, Clients, Contact |
| Listings | **Real (partial)** | Venera + Skyhills are real; photos still placeholder |
| Track record ledger | Placeholder | 4 invented deals — needs real closings |
| Market Insights | **Real data** | Live DLD figures, see below |
| Testimonials | Placeholder | 3 invented quotes |
| Contact — phone | **Real** | Click-to-call, live |
| Contact — WhatsApp | **Assumed** | `wa.me` link built from the real mobile — confirm that number has WhatsApp |
| Contact — email | Pending | `hello@suitbro.ae` — becomes real once the domain is bought and a mailbox exists |
| Contact form | Not wired | Validates and confirms on screen, but delivers nowhere yet |

### Real listings currently live

**Venera, The Valley** — AED 3,400,000 · 4 bed / 5 bath · Emaar townhouse community
*Tagline: "Best-priced 4BR | High-ROI potential | ..."*

**Skyhills Residences 2, JVC** — AED 1,150,000 · 1 bed / 2 bath · District 18, Jumeirah Village Circle
*Tagline: "Prime 1BR | Skyhills Residences 2 | Hot deal"*

⚠️ Both taglines were cut off in the source screenshot and partially reconstructed. **Verify exact wording before going live.**

---

## Market Insights — Data Source

Pulled from **DXB INTERACT** (Dubai Land Department transactions + Ejari rental contracts), re-queried live on 12 Sep 2026 for this build.

Currently displayed, period **23 Jun – 10 Sep 2026**:

- **Citywide pulse:** 43,666 transactions · AED 1,197,119 median sale price · 162 areas tracked
- **Busiest areas by volume:** Madinat Al Mataar (5,271), Al Barsha South Fourth (2,955), Jabal Ali First (2,260), Jabal Ali Industrial Second (2,226), Wadi Al Safa 4 (1,915)
- **Area comparison (flats):** Dubai Marina AED 2.54M / 4.51% · Business Bay AED 1.71M / 4.92% · Downtown AED 3.00M / 5.16% · Palm Jumeirah AED 5.49M / 3.85%
- **Top rental yields:** Al Hebiah Second (11.82%), DIP First (8.52%), Al Goze Fourth (7.26%), Al Warsan First (7.20%), Al Merkadh (6.73%), Al Kheeran (6.62%), Al Thanyah Third (6.52%), Al Yelayiss 2 (6.50%)

Two things worth knowing about this data:

**DLD area names differ from marketing names.** Dubai Marina is registered as *Marsa Dubai* and Downtown as *Burj Khalifa*. Both are shown on the page so the figures can be traced back to the source.

**Sample sizes are published alongside the yields on purpose.** Al Goze Fourth's 7.26% rests on six rental contracts and Al Kheeran's 6.62% on five sale transactions — thin enough that they are noise, not signal. Showing the sample count is what separates this page from the yield tables everyone else publishes.

These are a snapshot, not a live feed — the numbers are written into the HTML. Worth refreshing every quarter or so; ask and they can be re-pulled and updated.

---

## Needs From You

- [ ] RERA licence number (brokerage confirmed as M R ONE Properties from the photos — verify)
- [ ] Confirm which photos are you: the two office portraits are used as yours; the event shot on Clients is captioned neutrally until you say
- [ ] Confirm the Emaar award framing — the plaque reads No. 2, M R ONE Properties, so it is presented as a brokerage placing, not a personal one
- [ ] Photos for the Venera and Skyhills listings
- [ ] Confirm exact listing taglines (source screenshot was cropped)
- [ ] Past closed deals for the track record page
- [ ] 2–3 real client testimonials
- [ ] Buy `suitbro.ae` and set up the `hello@` mailbox
- [ ] Confirm +971 55 772 6097 is on WhatsApp (the floating button assumes it is)
- [ ] **Confirm the spelling of your name.** The site says "Abdul Fatah" throughout;
      the intro animation says "Abdul Fathah" (your wording, and your GitHub handle).
      One of the two is wrong and it is the most visible word on the site.
- [ ] Bio background — how you got into Dubai real estate
- [ ] Real figures for the stat blocks (deals, transaction value, years, referral rate)

---

## Ideas / Not Yet Built

- Area guides as individual pages (SEO value for "buy apartment in [area]" searches)
- Mortgage / ROI calculator on Market Insights
- Contact form needs a real backend or a service like Formspree to actually deliver messages
- Listing photography and a proper gallery/lightbox
- Analytics

---

## Domain

**suitbro.ae** — chosen for the brand over the personal name (it is the half people
repeat), and `.ae` over `.com` for local credibility in the Dubai market.

The site is already wired for it: canonical tags and `og:url` on all seven pages,
plus `sitemap.xml` and `robots.txt`. See the README for the Railway + DNS steps.
Note `.ae` may require a UAE trade licence at registration — the registrar will say
at checkout.

Serve the bare apex, not `www` — the canonical tags name `suitbro.ae`, so redirect
`www` to it rather than serving the same pages twice.

---

## Changelog

**12 Sep 2026** — Initial build. 7-section single-page site, navy/brass palette, Dubai market data section wired up via DXB INTERACT.

**12 Sep 2026** — Palette swapped to black `#000000` + gold `#FFA800`.

**12 Sep 2026** — Rebuilt as a 7-page site (one file per nav item, shared `styles.css`). Renamed "Suited Bro" → "Suit Bro" throughout. Redesigned to black-dominant with gold as sole accent, alternating section tones, generous whitespace. "Book a call" wired to `tel:+971557726097`. Listings replaced with two real properties (Venera / Skyhills Residences 2).

**12 Sep 2026** — Packaged for deployment: added `server.js` (dependency-free Node static server), `package.json`, `railway.json`, `README.md`. Verified all routes serve correctly. Prepared for GitHub → Railway deploy.

**12 Sep 2026** — Built out and committed to the repo. Closed two of the open gaps: added a working mobile nav (hamburger below 800px — links were previously just hidden) and a floating WhatsApp button. Market Insights re-queried live against DXB INTERACT rather than reusing the written-in figures, and extended with a busiest-areas-by-volume table, sample-size columns on every yield row, and the DLD's own area naming. Server hardened against path traversal and given extension-less URL support. Every placeholder tagged inline with `<!-- PLACEHOLDER: -->` / `<!-- VERIFY: -->` so nothing invented can reach production unnoticed.

**12 Sep 2026** — Wired the site for its own domain, `suitbro.ae`, rather than the generated Railway hostname: canonical URLs and Open Graph tags (`og:url`, `og:site_name`, `og:locale`) on all seven pages, plus `sitemap.xml` and `robots.txt`. Verified both new files serve with the right MIME types. Renamed the default branch to `main`.

**21 Sep 2026** — Design pass two. Modernised the shared system (wider type scale, grain and directional gold glows, layered surfaces, gold-gradient figures, scroll reveals) and rebuilt the homepage around it, then rolled the same treatment across the remaining six pages. Added liquid-glass surfaces — backdrop blur with specular edges and a hover sheen — over new ambient `.orb` light, since glass needs something behind it to refract. Swapped the body face from IBM Plex Sans to Manrope. Added the landing-page intro animation.

**21 Sep 2026** — Fixed the intro not appearing. It had a once-per-browser-session guard that was never asked for; any earlier load in the same tab consumed it, so in practice the animation was invisible. Now plays on every landing-page load, with a tap/key/scroll to skip and a slightly tighter 2.7s timeline.

**21 Sep 2026** — Added real photography. Five supplied images resized and re-encoded for web (3.6MB of originals down to 732KB): two office portraits now carry the home and About heroes in place of the gradient blocks, the Emaar Quarter 2 Broker Awards photo anchors a new Recognition section on Track Record, and two event photographs sit on Clients. Photos get a warm tint and a dark foot so they sit in the palette and overlaid type stays readable. Brokerage identified as **M R ONE Properties** from the name badges and the award plaque.

**21 Sep 2026** — Second batch of photography. Three new images added (a fourth was byte-identical to one already shipped and was skipped): the Azizi Channel Partners backdrop now anchors a *developer access* block on Track Record, an event close-up gives Contact a face to go with the phone number, and an off-duty shot gives About a human beat — fitting, given "Suit Bro" is a personality brand. Eight images total, 1.3MB, every one used on a page.

**Wording checked, not inflated.** The Azizi photograph shows an event backdrop, not a trophy, so the copy says "channel partner" and lists the projects on the wall rather than implying an award. The Emaar plaque names the brokerage, so that stays a brokerage placing.
