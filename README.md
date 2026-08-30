# The Todd House — Website

A redesign of [toddhouse.net](https://www.toddhouse.net/) for **The Todd House: A Victorian Bed & Breakfast**,
330 Third Street, Beaver, PA 15009.

The brief was *modern, but still classic and historic*. The result is a hand-built static site: an
editorial layout with generous whitespace and large photography, set in Cormorant Garamond over a
cream/navy/gold palette drawn from the house itself.

## What's here

| Page | File | Contents |
| --- | --- | --- |
| Home | `index.html` | Hero, availability bar, the story, amenities, room preview, breakfast, the house, area |
| Rooms & Suites | `rooms.html` | Rates, the three suites in detail, the three shared-bath rooms, the Angel & Cranberry baths |
| The House | `house.html` | Parlor & library, music room, dining room, game room, courtyard, porch, and the smaller rooms |
| Gallery | `gallery.html` | Filterable photo grid with a keyboard-accessible lightbox |
| Reservations | `reservations.html` | Booking routes, rates, house rules, cancellations, gift certificates, inquiry form |
| About & FAQs | `about.html` | The story, the hosts, memberships, and the eight questions guests ask most |
| Contact | `contact.html` | Address, phone, email, hours, map, payment methods, message form |

## Technical notes

- **No framework, no runtime dependencies.** Plain HTML, one stylesheet, one small JavaScript file.
  Upload the repository to any host and it works.
- **Fonts are self-hosted** in `assets/fonts/` (Cormorant Garamond, Source Serif 4, Montserrat —
  SIL Open Font License). No third-party font requests, so the site is faster and makes no calls
  to Google from a visitor's browser.
- **Images** are served as WebP with JPEG fallbacks, sized and lazy-loaded, with real alt text.
- **Progressive enhancement.** Every page reads and every link works with JavaScript disabled.
  JS adds the mobile menu, the lightbox, the gallery filters, the FAQ accordion and scroll reveals.
- **Accessibility.** Skip link, visible focus rings, labelled form fields, correct heading order,
  `aria-current` on the active nav item, and `prefers-reduced-motion` respected throughout.
- **SEO.** Per-page titles, descriptions, canonicals and Open Graph tags, plus `BedAndBreakfast`
  structured data on the home page, `sitemap.xml` and `robots.txt`.

## Editing the site

The seven root `.html` files are **generated** — edit the sources, not the output:

```
src/pages/*.html       page content (a small `<!--meta -->` block sets title, description, OG image)
src/partials/*.html    the shared head, header, footer and lightbox markup
src/schema/*.json      structured data
assets/css/site.css    the whole design system — colours, type and components are tokenised at the top
assets/js/site.js      behaviour
```

Then rebuild (Node 18+, no packages to install):

```bash
node build.mjs
```

The generated pages are committed, so deployment never needs a build step.

To preview locally: `npx serve` and open the address it prints.

## Content sources

Copy, rates, room details, policies and FAQs are taken from the existing toddhouse.net pages and
rewritten for the new layout. Photography is the property's own, pulled from the current site and
re-optimised. Booking links point at the existing RezStream page.

## Before going live — a short punch list

1. **Forms.** `reservations.html` and `contact.html` currently open the visitor's email client
   pre-filled (`data-mailto` in the markup). If you'd rather they post to an inbox directly, point
   the `<form>` at a form service — the fields are already named sensibly.
2. **Photographs for three rooms.** The Rose, Sapphire and Blue Lace rooms are presented as
   text-forward cards because no photograph on the old site could be matched to them with
   confidence. Supply one image each and they can be given the same treatment as the suites.
   A front-elevation photograph of the house would also be worth having — the old site's exterior
   shots are no longer retrievable from its CDN.
3. **Domain paths.** Canonical URLs, `sitemap.xml` and the Open Graph tags assume the site is served
   from `https://www.toddhouse.net/`. Update them if that changes.
4. **Reviews.** The old site had an empty reviews page. If there are testimonials worth quoting,
   they would sit naturally on the home page beneath the quote block.
