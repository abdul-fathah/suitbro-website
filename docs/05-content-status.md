# 05 — Content status

What on this site is true, and what is not.

## Real

| Thing | Source |
|---|---|
| Phone number `+971 55 772 6097` | Confirmed, click-to-call, live |
| Brokerage — M R ONE Properties | Name badges and the award plaque in supplied photos |
| Emaar Q1 2026 — **No. 1** | The trophy on the office shelf |
| Emaar Q2 2026 — **No. 2** | The plaque in the award photograph |
| Azizi Channel Partners | The event backdrop in a supplied photograph |
| Market Insights figures | Dubai Land Department, 23 Jun – 10 Sep 2026 |
| Venera and Skyhills listings | Real properties, real prices |
| All twelve photographs | Supplied directly |

**Both Emaar placings are brokerage-level**, read off the trophy and the
plaque. They are written as M R ONE Properties placings, not personal awards,
because that is what the evidence supports. The Azizi photograph shows an
event backdrop, not a trophy, so the copy says "channel partner" and names the
projects on the wall.

## Invented — must be replaced before launch

| Thing | Where |
|---|---|
| "120+ deals closed" | Home, About |
| "AED 480M transaction value" | Home, About |
| "8 years in Dubai" | Home, About |
| "62% repeat & referral" | About |
| Four track-record rows | Track Record |
| Three client testimonials | Clients |
| Bio copy | About |
| Hero headline and lede | Home |
| Email `hello@suitbro.ae` | Contact, footer — not a working mailbox |

Every one is marked `<!-- PLACEHOLDER: -->` in the source, shows as a red
badge in development and staging, and triggers a warning when building
production.

## Unverified

| Thing | Why |
|---|---|
| Both listing taglines | Reconstructed from a cropped screenshot |
| WhatsApp link | Built from the mobile number; not confirmed as WhatsApp |
| Who is in the event photographs | Only the office portraits are confirmed |

Marked `<!-- VERIFY: -->`, shown as gold badges outside production.

## Open questions

1. **The name.** The intro animation reads "Abdul Fathah". Every page reads
   "Abdul Fatah". One is wrong, and it is the most visible word on the site.
2. **RERA licence number.** Still shown as "licence number to be added".
3. **Listing photography.** No photographs of Venera or Skyhills — those two
   cards are the last visibly empty thing on the site.
4. **The contact form delivers nowhere.** It validates and confirms on screen,
   then does nothing. Every enquiry through it is currently lost.

## Repository visibility

The GitHub repository is **public**. Given it contains personal photographs
and the invented figures above, it should be private until launch:
Settings → Danger Zone → Change repository visibility.
