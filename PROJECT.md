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
├── public/               ← all pages + styles.css + app.js (everything user-facing)
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

**Server:** plain Node `http` module, zero npm dependencies. Nothing to install, nothing to break on build. Reads `process.env.PORT` so Railway's assigned port works automatically. Extension-less URLs resolve (`/about` → `about.html`); unmatched routes fall back to the homepage; path traversal is rejected. Files are streamed rather than read into memory, and HTTP Range requests are honoured — so video seeks properly and a large file never sits in RAM per request.

**Tested:** every page returns 200, `styles.css` serves as `text/css`, extension-less routes resolve, unknown routes fall back to the homepage, `../` traversal is blocked, non-GET returns 405, and HTTP Range returns correct partial content (verified against byte offsets, including open-ended and suffix ranges, with 416 on unsatisfiable).

---

## Responsive & QA

Audited across **320, 390, 768, 1024, 1440 and 1920px**, on all seven pages, measuring horizontal overflow, every image's rendered geometry, image up/oversizing, and tap-target heights.

| Check | Result |
|---|---|
| Horizontal overflow | 0 at every width |
| Images rendering too tall | 0 |
| Images upscaled (blurry) | 0 |
| Images oversized (wasted bytes) | 0 |
| Tap targets under 40px | 0 |

**The one real bug found, and fixed.** `.photo img` set `width: 100%` and `aspect-ratio`, but never `height: auto`. The `<img>` tags carry `width`/`height` attributes to reserve layout space, and that height is a presentational hint the browser honours unless CSS overrides it — **an explicit height makes `aspect-ratio` inert**. So on a phone these photographs rendered at their full natural height: a 278px-wide column containing a 1597px-tall image. One line, `height: auto`, fixed all of them.

**Responsive images.** Each photograph now ships at 480w, sometimes 900w, and full size, wired up with `srcset`/`sizes`. A phone at 2x pulls the 900px variant rather than the 1500px original; the full file is only fetched on a 3x display that can actually use it.

**Phone framing.** Below 560px tall photographs crop to 4:5 rather than 3:4, biased upward so faces stay in frame, so no single image becomes a scroll wall.

Note: the marquee ticker track and the decorative `.orb` gradients are intentionally wider than the viewport and are clipped by `overflow: hidden` on their containers. They show up in a naive "element wider than screen" scan; page-level overflow is zero.


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
| Event / awards photography | **Real** | Twelve images across all pages except Market Insights |
| Listings | **Real (partial)** | Venera + Skyhills real, now with verified project data; photography still outstanding |
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

Currently displayed, period **23 Jun – 18 Sep 2026** (refreshed 24 Sep):

- **Citywide pulse:** 47,835 transactions · AED 1,200,000 median sale price · 165 areas tracked
- **Busiest areas by volume:** Madinat Al Mataar (5,271), Al Barsha South Fourth (2,955), Jabal Ali First (2,260), Jabal Ali Industrial Second (2,226), Wadi Al Safa 4 (1,915)
- **Area comparison (flats):** Dubai Marina AED 2.54M / 4.51% · Business Bay AED 1.71M / 4.92% · Downtown AED 3.00M / 5.16% · Palm Jumeirah AED 5.49M / 3.85%
- **Top rental yields:** Al Hebiah Second (11.82%), DIP First (8.52%), Al Goze Fourth (7.26%), Al Warsan First (7.20%), Al Merkadh (6.73%), Al Kheeran (6.62%), Al Thanyah Third (6.52%), Al Yelayiss 2 (6.50%)

Two things worth knowing about this data:

**DLD area names differ from marketing names.** Dubai Marina is registered as *Marsa Dubai* and Downtown as *Burj Khalifa*. Both are shown on the page so the figures can be traced back to the source.

**Sample sizes are published alongside the yields on purpose.** Al Goze Fourth's 7.26% rests on six rental contracts and Al Kheeran's 6.62% on five sale transactions — thin enough that they are noise, not signal. Showing the sample count is what separates this page from the yield tables everyone else publishes.

These are a snapshot, not a live feed — the numbers are written into the HTML. Worth refreshing every quarter or so; ask and they can be re-pulled and updated.

---

## Before going live

1. **Make the repository private.** It is currently public. GitHub → Settings → Danger Zone → Change repository visibility. It has been public since 12 Sep, so assume the content has been crawlable.
2. **Replace the invented content** — the stats, the bio, the four track-record rows, the three testimonials. All are tagged `<!-- PLACEHOLDER: -->` in the markup.
3. **Settle the name spelling** — the intro says "Abdul Fathah", every page says "Abdul Fatah".
4. **Buy the domain** and connect it (see Domain, below).
5. **Wire the contact form** to a real endpoint — it currently confirms on screen but delivers nowhere.
6. Optionally add listing photography for Venera and Skyhills, the last visibly empty thing on the site.

---

## Needs From You

- [ ] RERA licence number (brokerage confirmed as M R ONE Properties from the photos — verify)
- [ ] Confirm which photos are you: the two office portraits are used as yours; the event shot on Clients is captioned neutrally until you say
- [ ] Confirm the Emaar framing — the Q1 2026 trophy reads **No. 1, M R ONE Properties** and the Q2 plaque reads **No. 2**, so both are presented as brokerage placings, not personal ones
- [ ] One supplied photo was left out: a bathroom mirror selfie. Say the word if you want it in anyway
- [ ] Photos for the Venera and Skyhills listings — drop them in `public/images/listings/`, see the README there
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

**21 Sep 2026** — Third batch of photography, and a better credential. The trophy visible on the office shelf reads **Quarter 1 Broker Awards 2026 · EMAAR · No. 1 · M R ONE Properties**, which alongside the Q2 plaque makes Recognition a two-quarter story rather than a single placing: first in Q1 2026, second in Q2. Four images added — the Emaar Q1 step-and-repeat and the Q2 trophy now sit side by side, the office shot with the award shelf backs the About credentials, an off-market section on Listings (previously the only page with no photography), and a "straight answers" section on the homepage.

**One photo deliberately not used:** a bathroom mirror selfie. Blurry, and the setting works against everything else on the site. Easy to add if wanted.

**21 Sep 2026** — Made the server video-capable ahead of any video being supplied: added mp4/webm/mov/ogv and audio content types, switched from reading whole files into memory to streaming them, and implemented HTTP Range (206) support. Without Range a `<video>` element cannot seek and buffers the entire file before playing. Range was verified against byte offsets, including open-ended and suffix forms, with 416 on unsatisfiable ranges.

**21 Sep 2026** — Pre-launch pass. Audited all seven pages at six widths from 320 to 1920px. Found and fixed a real mobile bug: `.photo img` had `aspect-ratio` but no `height: auto`, so the `height` attribute on each `<img>` kept the CSS ratio inert and photographs rendered at full natural height inside narrow columns — over 1500px tall on a phone. Added responsive `srcset`/`sizes` with 480w and 900w variants, tightened phone crop ratios, and added `vercel.json` so the site can deploy to Vercel as static files as well as to Railway as a Node app. Overflow, oversizing, upscaling and tap-target checks all now read zero.

**24 Sep 2026** — Market Insights was the only page with no visual content. It now carries four charts rather than a photograph, because the page's value is the data, not another portrait. Figures refreshed against DXB INTERACT first: 47,835 transactions (was 43,666) over 23 Jun – 18 Sep, 165 areas, and the homepage ticker and insight strip were resynced to match.

Chart decisions, made by method rather than taste. Each chart is a single series, so bar length carries the magnitude and colour carries nothing — the brand gold was kept after checking it reaches 9.52:1 contrast on the chart surface, well past the 3:1 threshold for graphics. Price and yield for the four prime areas are deliberately **two separate charts**, never one chart with two axes. Yields resting on a thin sample are **hatched rather than recoloured**, so the caveat survives for colourblind readers and in print; a legend names the distinction and the tooltip spells it out. Every bar carries an aria-label and a hover/focus tooltip, and each chart keeps its full table underneath as the accessible fallback.

**24 Sep 2026** — Figures now animate. Stats count up from zero and chart bars grow in when they scroll into view, and the shared page behaviour moved out of seven duplicated inline scripts into one `public/app.js`.

**What was deliberately not built: a fake live feed.** The request was for animation suggesting the figures update in real time. They do not — the data is a snapshot pulled by hand and written into the HTML. A ticking counter or a "LIVE" badge would imply a feed that does not exist, on the one page whose credibility rests entirely on the numbers being checkable. What went in instead is a count-up on reveal, which reads as motion without claiming currency, plus a freshness stamp that computes its own relative age in the browser ("Updated today", "Updated 3 weeks ago") from a date in the HTML. That is genuinely dynamic and it ages honestly — it will say "Updated 2 months ago" when that is true, which is also a useful nudge to refresh.

Degradation was tested rather than assumed, in four states: normally (counts up, lands exactly on the written value), under `prefers-reduced-motion` (real values immediately, nothing animated), with the observer never firing (a six-second failsafe releases every bar), and with JavaScript disabled entirely (every figure, every full-width bar and the absolute date all present). The pre-animation state is installed by `app.js` itself rather than by the stylesheet, so a failure to load that file leaves the page correct rather than blank.

**24 Sep 2026** — Listing photography still cannot be added: none was supplied, and generating or borrowing images of real units at real prices is the one thing on this site that could mislead a buyer outright. What went in instead:

- **Verified project data on both cards**, pulled from DLD-backed project records. Venera: Emaar, handover Q3 2028, 51.7% complete, project four-bed median AED 3.35M across 348 homes, and four-bed price per sqft running about 28% below the area average — which is the first evidence on the site for the existing "best-priced 4BR" tagline. Skyhills Residences 2: developer HRE, 95% complete with handover imminent, project one-bed median AED 1.28M across 238 units, and a post-handover plan spreading 50% over 24 months after keys.
- **The empty photo slot now carries a fact** ("51.7% built · handover Q3 2028") instead of apologising with "Photography to follow".
- **`public/images/listings/`** with a README naming the exact files to drop in, and `scripts/resize-images.js` to generate the 480w/900w variants.

Note the DLD area names differ from the marketing ones again: Venera sits in Al Yufrah 1, Skyhills in Al Barsha South Fourth (which is what JVC is registered as).
