# Listing photography

Drop photos here and the listing cards pick them up. Nothing else to change
except the `<img>` line in the card.

## What to send

| File name | Property | Shows |
|---|---|---|
| `venera-1.jpg` | Venera, The Valley | Exterior or the best single shot |
| `venera-2.jpg` … | Venera | Interior, community, whatever you have |
| `skyhills-1.jpg` | Skyhills Residences 2 | Exterior or the best single shot |
| `skyhills-2.jpg` … | Skyhills | Interior, view, amenities |

Landscape, at least 1500px wide. Straight off a phone is fine — well-lit and
level beats professional and dark.

## After adding a file

Two steps:

1. Generate the smaller sizes so phones do not download the full file:
   ```bash
   node scripts/resize-images.js
   ```
2. In `public/listings.html` (and `public/index.html` for the two featured
   cards), replace the `<div class="listing-media is-empty">…</div>` block with:
   ```html
   <div class="listing-media">
     <img src="images/listings/venera-1.jpg"
          srcset="images/listings/venera-1-480.jpg 480w,
                  images/listings/venera-1-900.jpg 900w,
                  images/listings/venera-1.jpg 1500w"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 560px"
          alt="Venera, The Valley — four-bedroom townhouse"
          width="1500" height="1000" loading="lazy">
     <span class="tag">Townhouse</span>
   </div>
   ```

## Photos of what, ideally

In the order a buyer actually cares about:

1. The exterior, straight on, in daylight
2. The main living space
3. The kitchen
4. The primary bedroom
5. Whatever the community gives you — pool, park, the lagoon at The Valley

One good exterior beats six mediocre interiors. If you only send one per
property, send that.

## Do not put anything here that is not yours

Developer renders from Emaar or HRE are usually fine to use as a partner
brokerage, but check your agreement. Images pulled from a portal or another
brokerage's site are not yours to publish.
