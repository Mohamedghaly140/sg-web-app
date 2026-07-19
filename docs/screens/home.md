# Home — `/`

Server Component (`HomeFeature`, `docs/phase-1-catalog.md` §1.5). All four sections fetch in parallel; each has its own loading/error boundary so one failing rail doesn't take down the rest of the page.

## Section order

1. Hero (static)
2. Shop by Category
3. Featured
4. New Arrivals

Navbar above, footer below — see [`shared-shell.md`](./shared-shell.md).

## Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR — see shared-shell.md                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Elegant Couture, Delivered to Your Door          [ hero image ]      │  │
│  │  Discover this season's collection.                                   │  │
│  │  [ Shop Now → ]                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Shop by Category                                          [ View all → ]  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │        │
│  │ Dresses│ │ Abayas │ │ Hijabs │ │ Bags   │ │ Shoes  │ │ Sets   │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                                              │
│  Featured                                                   [ View all → ] │
│  ┌───────────┐┌───────────┐┌───────────┐┌───────────┐  (scroll →)          │
│  │  [image]  ││  [image]  ││  [image]  ││  [image]  │                      │
│  │  Name     ││  Name     ││  Name     ││  Name     │                      │
│  │  ★4.5 (12)││  No       ││  ★5.0 (3) ││  ★4.0(40) │                      │
│  │  120 EGP  ││  reviews  ││  ~~200~~  ││  60 EGP   │                      │
│  │           ││  yet      ││  150 EGP  ││  Low stock│                      │
│  └───────────┘└───────────┘└───────────┘└───────────┘                      │
│                                                                              │
│  New Arrivals                                                [ View all → ]│
│  ┌───────────┐┌───────────┐┌───────────┐┌───────────┐  (scroll →)          │
│  │   ...same card shape as Featured...                                     │
│  └───────────┘└───────────┘└───────────┘└───────────┘                      │
│                                                                              │
├────────────────────────────────────────────────────────────────────────────┤
│ FOOTER — see shared-shell.md                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

## Narrow width

- **Hero:** image moves above/behind the text, stacked vertically, CTA full-width.
- **Shop by Category:** grid wraps to 2–3 columns, still capped at 6–8 tiles, no horizontal scroll.
- **Featured / New Arrivals:** single-row horizontal-scroll rail, cards ~70–80% viewport width with a visible peek of the next card as a scroll affordance; scrollable by touch and by arrow keys when focused.

## Section detail

### 1. Hero (static)

Hardcoded headline, subtext, one CTA button linking to `/products`, one hero image. No carousel, no backend call, no CMS — content lives in the component/copy, not fetched.

### 2. Shop by Category

- **Call:** `GET /categories` (Public, `docs/integration/storefront/02-categories.md`), `next: { revalidate: 300, tags }`.
- Top-level categories only (not nested `subCategories`), capped at 6–8. More exist → "View all" links to `/categories`; fewer exist → show what's there, no placeholder tiles.
- Tile = category `imageUrl` (nullable — needs a stable fallback graphic) + `name`, links to `/categories/[slug]`.

### 3. Featured

- **Call:** `GET /products?featured=true&limit=10` (Public, `01-products.md`), `next: { revalidate: 60–300, tags }`.
- Card: image, name, `formatEGP(price)`, original price struck through only when `discount` is present, `ratingsAverage`/`ratingsQuantity` (null → "No reviews yet"), low-stock/sold-out badge from `quantity` (advisory only), links to `/products/[slug]` even at advisory zero stock.
- No featured products → section renders nothing, not an empty/placeholder rail.
- **"View all"** links to `/products?featured=true`.

### 4. New Arrivals

- **Call:** `GET /products?sort=newest&limit=10` — same card shape as Featured.
- **"View all"** links to `/products` (newest is already the default sort).

## Open scope note

Customer Care footer links (About/Contact/Shipping & Returns) referenced from the shared shell have no phase doc covering their content pages yet — resolve before wiring real `href`s (see `shared-shell.md`).
