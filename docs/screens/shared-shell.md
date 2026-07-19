# Shared Shell — Navbar & Footer

Rendered on every route via the root layout (Phase 0 §0.5, `docs/phase-0-foundation.md`). Wireframed once here; screen files reference this instead of repeating it.

## Navbar

### Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Logo]   Home   Products   Categories     [🔍 Search products.....]  [♡] [🛒 2] [Sign in ▾] │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Logo** — links to `/`.
- **Home / Products / Categories** — Phase 0 baseline nav links.
- **Search input** — submits to `/products?search=<value>` (`GET /products` `search` param, `01-products.md`). No live-search API; plain navigate-on-submit field.
- **Wishlist icon** `[♡]` — visual placeholder only in Phase 0/1; wishlist is Auth-only, lands in Phase 4. Guests see the icon and get an inline sign-in prompt on click, never a hard redirect.
- **Cart icon** `[🛒 2]` — badge count from cart state (`useCart()`); opens the cart drawer. Placeholder slot in Phase 0, real data in Phase 2.
- **Sign in / account control** — Clerk signed-out shows "Sign in"; signed-in shows an account menu. Round-trip only in Phase 0; full catch-all auth pages land in Phase 3.

### Narrow width

```
┌───────────────────────────────┐
│ [☰]        [Logo]        [🔍] [♡] [🛒 2] │
└───────────────────────────────┘
```

`[☰]` opens a sheet with Home / Products / Categories links and the sign-in/account control. `[🔍]` opens a search sheet with the same input.

## Footer

### Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Logo]              Shop              Customer Care         Stay in the loop │
│ One-line brand      Home              About Us               Get updates on   │
│ blurb.              Products          Contact                new arrivals.    │
│                     Categories        Shipping & Returns      [email________] │
│ [IG][FB][TikTok]                      (static pages, TBD)     [ Notify me ]   │
│                                                                (visual only,   │
│                                                                 no submit)     │
│──────────────────────────────────────────────────────────────────────────│
│ © 2026 SG Couture. All rights reserved.              [ Cash on Delivery ]    │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Shop column** — same links as navbar.
- **Customer Care column** — About Us / Contact / Shipping & Returns are static informational pages. **Not covered by any current phase doc** — flag before implementing; either add a lightweight static-pages task to a phase or drop these links until the pages exist. Never link to a route that doesn't exist.
- **Newsletter block** — visual-only teaser (email input + button). No subscribe endpoint exists in the backend contract; do not wire a submit handler or fake a success state.
- **Payment badge** — "Cash on Delivery" only, matching v1's CASH-only checkout. No card-network logos; `CARD` returns `422 PAYMENT_METHOD_UNAVAILABLE` until backend Phase 7.
- **Social icons** — static external links, no backend.

### Narrow width

Columns stack vertically: brand/social → Shop → Customer Care → Newsletter → copyright/payment badge.
