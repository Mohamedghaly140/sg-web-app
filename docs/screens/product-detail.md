# Product Detail — `/products/[slug]`

Server Component (`ProductDetailFeature`, `docs/phase-1-catalog.md` §1.3–1.4). Product, gallery, and info panel come from one `GET /products/:slug` fetch; reviews are fetched separately (keyed by the product's `id`, paginated via nuqs) so paging reviews doesn't refetch the product. Cart and wishlist controls render now but are inert until Phase 2 and Phase 4 wire them up.

## Section order

1. Breadcrumb (Category / Subcategory / Product name)
2. Gallery (thumbnails + main image, wishlist heart overlay)
3. Info panel (name, rating summary, price block, size/color selectors, quantity stepper, stock hint, Add to Cart / Buy Now, share)
4. Description
5. Reviews (rating recap + first-page list, paginated, gated "Write a review")
6. Related products (same-category rail)
7. Sticky mobile Add to Cart bar (mobile only, appears on scroll)

Navbar above, footer below — see [`shared-shell.md`](./shared-shell.md).

## Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR — see shared-shell.md                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Dresses / Evening Dresses / Satin Cowl-Neck Dress                         │
│                                                                              │
│  ┌────────┐  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │ [thumb]│  │                          │  │  Satin Cowl-Neck Dress      │  │
│  │ [thumb]│  │                          │  │  ★4.5 (12 reviews)          │  │
│  │ [thumb]│  │      [ main image ]  [♡] │  │  EGP 2,040   ~~EGP 2,400~~  │  │
│  │ [thumb]│  │                          │  │  [ -15% ]                   │  │
│  │(scroll↓)│  │                          │  │                             │  │
│  └────────┘  └──────────────────────────┘  │  Color: [ Black ][Emerald]  │  │
│                                              │  Size:  [ S ][ M ]          │  │
│                                              │  Qty:   [ - 1 + ]  8 left   │  │
│                                              │                             │  │
│                                              │  [ Add to Cart ] [Buy Now]  │  │
│                                              │  [ Share ]                  │  │
│                                              └────────────────────────────┘  │
│                                                                              │
│  Description                                                                │
│  Floor-length satin evening dress...                                        │
│                                                                              │
│  Reviews  ★4.5 · 12 reviews                                 [Write a review]│
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ★★★★★  "Loved it" — Jane D.                        2026-05-01        │  │
│  │ ★★★★☆  "Great fit" — Sara K.                       2026-04-20        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│  [ ← ]  Page 1 of 3  [ → ]                                                  │
│                                                                              │
│  You may also like                                          [ View all → ] │
│  ┌───────────┐┌───────────┐┌───────────┐┌───────────┐  (scroll →)          │
│  │  [image]  ││  [image]  ││  [image]  ││  [image]  │                      │
│  │  Name     ││  Name     ││  Name     ││  Name     │                      │
│  │  EGP 1,200││  EGP 900  ││  EGP 2,100││  EGP 1,500│                      │
│  └───────────┘└───────────┘└───────────┘└───────────┘                      │
│                                                                              │
├────────────────────────────────────────────────────────────────────────────┤
│ FOOTER — see shared-shell.md                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

## Narrow width

- **Breadcrumb:** collapses to a single "← Dresses" back link.
- **Gallery:** full-width swipeable carousel with dot indicators; thumbnail rail is hidden; wishlist heart stays overlaid top-right of the main image.
- **Info panel:** stacks full-width below the gallery.
- **Add to Cart / Buy Now:** once the user scrolls past the inline buttons, a sticky bottom bar (price + both buttons) appears for reachability, hiding again near the footer.
- **Reviews:** list stacks single-column; pagination controls unchanged.
- **Related products:** stays a horizontal-scroll rail with narrower cards, same as desktop.

## Section detail

### 1. Breadcrumb

Derived from the same `GET /products/:slug` response (`category.name`/`slug`, `subCategories[0]`) — no extra call. Links to `/categories/[slug]`.

### 2. Gallery

- **Call:** `GET /products/:slug` (Public, `docs/integration/storefront/01-products.md`) → `images[]` ordered by `sortOrder` ascending, rendered with `next/image`.
- Tolerate a null `imageUrl`/`imageId` on any gallery item; fall back to the product's top-level `imageUrl`.
- Wishlist heart is a **Phase-1 inert placeholder** — the real toggle is Phase 4, auth-only (`PUT`/`DELETE /wishlist/:productId`, `docs/integration/storefront/04-wishlist.md`).

### 3. Info panel

- **Price block:** `price` shown struck through only when `priceAfterDiscount !== price`; `priceAfterDiscount` always shown via `formatEGP()`; discount badge from `discount`. No client-side money math.
- **Rating summary:** `ratingsAverage`/`ratingsQuantity` from the product response; `ratingsAverage: null` renders "No reviews yet", never zero stars.
- **Size/color selectors:** local component state built from the flat `sizes[]`/`colors[]` arrays. The contract has no per-variant (color×size) stock, price, or image matrix — selectors must not imply one. A selector is omitted entirely when its array is empty.
- **Quantity stepper:** bounded by `quantity` (advisory stock hint only, not reserved) — Phase 1 UI only.
- **Add to Cart:** `useMutation` calling a Server Action → `POST /cart/items` `{ productId, quantity, color?, size? }` (`docs/integration/storefront/05-cart.md`). **Phase 2 wiring** — rendered disabled/stub for now.
- **Buy Now:** same Add to Cart action, then `redirect("/checkout")` on success. **Phase 2** — no separate express-checkout path.
- **Share:** client-only Web Share API, no backend call.

### 4. Description

Same `GET /products/:slug` response, `description` field.

### 5. Reviews

- **Call:** `GET /products/:id/reviews?page=&limit=` (Public, paginated, `docs/integration/storefront/03-reviews.md`) — **keyed by the product's `id`, not `slug`**; server pagination driven by nuqs per `docs/phase-1-catalog.md` task 1.4.
- Rating recap reuses `ratingsAverage`/`ratingsQuantity` from the product response — there is no separate summary endpoint.
- "Write a review" is gated behind auth and "not already reviewed," and is deferred to Phase 4 (`POST /products/:id/reviews`).

### 6. Related products

- **Call:** `GET /products?category=<category.slug>&limit=8` (Public, `01-products.md`), current product `id` filtered out client-side — there is no dedicated related/similar-products endpoint.
- Horizontal scroll rail, same card shape as the Home page's Featured rail, reusing the shared `ProductCard` (`docs/phase-1-catalog.md`).
- No same-category products besides the current one → section renders nothing, not an empty/placeholder rail.
- **"View all"** links to `/categories/[slug]`.

### 7. Sticky mobile Add to Cart bar

Same actions as section 3, no additional call. Mobile-only, scroll-triggered.

## Suggested additions

Grounded in fields the backend already returns, worth folding in beyond the baseline:

- Discount badge (e.g. "-15%"), shown only when the product is actually discounted.
- Low-stock / sold-out badge using the existing semantic `warning`/`destructive` `Badge` variants, driven by advisory `quantity`.
- Null-safe "No reviews yet" rating state instead of zero stars.
- Subcategory chips linking into filtered category views.
- Native Web Share button — no backend dependency.
- Sticky mobile Add to Cart bar for one-thumb reachability.

## Open scope note

- No "recently viewed" data in the contract — would require client-only `localStorage`; not part of this spec.
- No "frequently bought together" data anywhere in the contract.
- No per-variant (color×size) stock/price/image matrix — only flat `sizes[]`/`colors[]` and a product-level advisory `quantity` exist.
- No review star-count histogram — only the aggregate `ratingsAverage`/`ratingsQuantity` exist.
