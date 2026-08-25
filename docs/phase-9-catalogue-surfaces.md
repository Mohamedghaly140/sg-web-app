# Phase 9 — Catalogue Surfaces (S1 Home, S2 Listing, S3 Product detail, S8 Categories)

**Objective:** compose the four public browsing screens to their designed layouts, keeping every existing filter, variant-selection and add-to-cart behaviour intact.

**Prerequisites:** Phase 8 DoD, including the list of unvariant `<Button>` call sites produced by task 8.3.

**API surface:** `GET /categories`, `GET /products`, `GET /products/:slug`, `GET /products/:id/reviews`, `GET /shipping/fee`. All Public, all already implemented — **this phase adds no new call.**

## Tasks

### 9.1 The product card (design variant `2a`)

- [x] Restructure `features/products/components/product-card.tsx` to the chosen variant. The card is bordered with `padding: 0` and no gap. The top is a 3:4 image area on surface with a 1px bottom hairline; the stock badge overlays top-left at `p-3` inset and the wishlist heart top-right at `p-2`. The body at `p-3` carries the product name (Cormorant 18px), a muted 12px subtitle of `category · colors`, then a baseline row holding `priceAfterDiscount`, the struck-through original `price`, and the discount tag pushed right with `margin-left: auto`. **Correction to this bullet's original text:** `ProductSummary` (`GET /products` list items) has no per-item `category` field — only `sizes`/`colors` — so the subtitle renders **colors only** (`product.colors.join(", ")`, omitted entirely when empty). Recorded as **GAP-10**: no per-item category on the list endpoint. Also dropped the card's `RatingSummary` line, confirmed with the project owner — the approved design has no rating on the card, only on the PDP buy box (9.4).
- [x] Apply the three conditional rules exactly as documented: the discount row appears only when `discount > 0`; the stock badge appears when `quantity <= 3`; the sold-out badge appears when `quantity === 0`, and the sold-out card renders its body at 60% opacity. Stock remains **advisory** — it is reserved at checkout, not in the bag — so nothing here may block interaction.
- [x] Build the card once and share it across Home and the listing. Verify the subtitle's data source: `GET /products` already returns `sizes` and `colors` per item, so no new call is needed.
- [x] Wrap the card image in the `.plate` structure from Phase 7 — outer `relative`, inner `.plate` around the `<Image>` only, badges and heart as **siblings** of the inner plate so the sepia grade does not tint them.

### 9.2 S1 Home

- [ ] Replace the hero. `features/home/components/hero.tsx` currently renders `bg-gradient-to-br from-accent/30 to-accent/10` — **a gradient, which the design system explicitly forbids** ("no filled accent blocks, no gradients"). The designed hero is a `1.15fr / 1fr` grid with a 520px-tall `.plate` campaign image on the left and centred copy on the right: a muted kicker, a 52px/1.03 weight-400 `h1`, a justified 44ch paragraph via `.measure`, then a primary and a secondary CTA.
- [ ] The existing `/hero-video.mp4` has no place in the design. Remove its usage; do not delete the asset until the campaign image is signed off.
- [ ] Flag the campaign image as a **content gap** — art direction at roughly 3:4 for product and 4:3 for category slots does not exist yet. Ship with the existing placeholder treatment rather than inventing imagery.
- [ ] Add "The collections": an `h3` plus an "All categories" link over a hairline, then three cards in a 3-column grid, each a 4:3 `.plate` with the category name below in Cormorant 19px and its `productCount` right-aligned in muted 12px tabular figures.
- [ ] Convert "New in" from the current horizontal scroll rail to a **4-column grid** at `gap-4`, reading `GET /products?featured=true&limit=4`. The design shows one card in each state — low stock, normal, sold out, normal — which is a useful manual check rather than a data requirement.
- [ ] Add "The makers" band **only if** the editorial copy gap from task 8.10 has been resolved. If it has not, omit the band and retarget the hero's secondary CTA to `/categories` rather than shipping placeholder prose.

### 9.3 S2 Product listing

- [ ] Compose the title band: an `h2` at 34px with a justified 56ch intro over a hairline.
- [ ] Build the controls row over a hairline: a **`Filter (N)`** primary button and a muted 12.5px "N of M pieces" count with tabular figures on the left, and the sort control on the right showing its value in accent.
- [ ] Add the **applied-filter row**, which does not exist today: an `APPLIED` label followed by one outline tag per active filter, each with a `✕` that removes exactly that one filter and refetches, plus a "Clear all" link that resets to the category default.
- [ ] Change the drawer's commit semantics. `features/products/components/products-filters.tsx` is **already a `Sheet`** ✅, so the panel itself is not new work — but the design requires that **opening the drawer does not fetch**, and that a footer `Show N pieces` button commits the query and closes. Pair it with a `Clear` secondary at `flex: 1` against the primary at `flex: 2`.
- [ ] Style the drawer to the design: a 340px panel on `--color-bg` with a right hairline and `shadow-lg`, `p-6`, a "Refine" header with a close icon button, and sections for Category (radios), Size (tag toggles), Colour (tag toggles) and Price (two inputs) separated by hairlines. The grid behind sits at `opacity: .45`.
- [ ] **Keep filter state in the URL.** The existing nuqs params own category, subCategory, sizes, colors, minPrice, maxPrice, sort, page and limit, and a filtered listing must stay shareable. Do not introduce `useState` for filters or pagination; the deferred-commit behaviour is local draft state that writes to the URL once, not a replacement for it.
- [ ] Note that `SIZE_OPTIONS` and `COLOR_OPTIONS` are hardcoded arrays in that file. This is recorded as **GAP-9** (no facet source); keep the arrays for now and let empty results speak for themselves rather than inventing availability.
- [ ] Render the grid at 4 columns with `gap-4`, and centre the pagination below as `Previous` / "Page N of M" / `Next` with disabled buttons at 45% opacity and tabular figures throughout.

### 9.4 S3 Product detail

- [ ] Compose the breadcrumb row in muted 12px over a hairline, then a `1fr / 380px` two-column grid at `gap-8`.
- [ ] Rebuild `features/products/components/gallery.tsx` as a `1fr / 108px` grid: a **660px fixed-height** hero `.plate` beside a vertical strip of three 3:4 thumbnail plates at `gap-2`, with the selected thumbnail's plate outline switching to accent via `.plate-selected`. **Do not give the hero an aspect ratio** — the handoff names the aspect-ratio hero as its one broken variant, so a later "improvement" that re-adds it is a regression.
- [ ] Replace the gallery's active-thumbnail `bg-primary` dot, which would render as a gold fill after Phase 7's token flip. The accent plate outline is the designed indicator.
- [ ] Order the buy box as designed at `gap-3`, self-aligned to start: kicker, 31px `h2` name, price row (Cormorant 22px `priceAfterDiscount`, 13px struck `price`, accent discount tag), a muted 12.5px rating line, hairline, the Colour block (label naming the selection, 26px round swatches, the selected one taking a 1px accent outline at 2px offset), the Size block (label plus a "Size guide" link, on the segmented control, with unavailable sizes **disabled at 40% opacity, never selectable**), a low-stock accent tag, then the block Add-to-bag and Save-to-wishlist buttons at 44px minimum height.
- [ ] Keep the existing purchase behaviour untouched: `product-purchase-provider.tsx` still owns selected colour, size and quantity and still calls `useAddCartItem`; add-to-bag stays disabled while a required variant is unchosen; `INSUFFICIENT_STOCK` still maps `errors[]` by `productId` to show "Only N available" beside the quantity control; `INVALID_VARIANT` still keeps the selection visible and refreshes via `router.refresh()`.
- [ ] Add the three 12.5px label/value rows below the buttons — Delivery, Payment, Returns. **The delivery row's day range has no source field** (recorded as **GAP-6**); render the fee from `GET /shipping/fee` and omit the "2–4 days" promise rather than hardcoding a shipping claim in the frontend.
- [ ] Compose the band below the fold as three columns over a hairline: The making, Care, and Reviews. **"The making" and "Care" have no API field** — render each column only if the product carries equivalent content, and omit it otherwise. Do not invent copy.
- [ ] **Verify `features/products/components/sticky-add-to-cart-bar.tsx` against the `.plate` stacking-context risk.** `filter` creates a containing block for `position: fixed`, so a sticky element inside a plated ancestor breaks. The bar is not in the design; keep it, restyle it, and scope it to mobile in Phase 13.

### 9.5 S8 Categories

- [ ] Compose the title band: an `h2` at 34px reading "The index", a justified 58ch intro, and a muted 12px "Updated hourly" note right-aligned.
- [ ] Build the 3-column grid at `gap-8`. Each column is a 4:3 `.plate`, then a category row with the name as a Cormorant 24px link in body colour and its `productCount` right-aligned under a hairline, then one hairline-separated row per sub-category with the name left and the count right in muted 12px tabular figures, the whole row linking into `?subCategory=`.
- [ ] Render sub-categories with `productCount: 0` at 45% opacity and **not as links**, with the design's 11.5px explanatory note. The handoff is emphatic that "a zero is a real answer, not a missing page", and this is the same treatment GAP-9 asks the backend to enable for filter facets.
- [ ] Add the footer shortcuts band as outline tags mapping to query strings: "New in" to `?sort=newest`, "Under 2,000 EGP" to `?maxPrice=2000`, "Top rated" to `?sort=top_rated`. **Drop "Ready to ship"** — no filter corresponds to it, and shipping a tag that lies is worse than shipping three.
- [ ] Note that counts are ACTIVE products only and may drift from a cached tree; do not add reconciliation logic.

### 9.6 Loading and error states

- [ ] Rebuild the four catalogue skeletons — `products-grid-skeleton.tsx`, `category-products-skeleton.tsx`, and the two home section skeletons — so they **match the final geometry**: surface blocks at the plate's aspect ratio and 12px text bars at 55–75% width. **No spinners in content areas.**
- [ ] Keep `RESOURCE_NOT_FOUND` on a product slug behaving as documented: treat the product as gone, drop it from caches, and offer the category. Do not convert it into a generic error.
- [ ] Restyle `section-error-boundary.tsx`'s bordered "unavailable right now" state and verify it still wraps the home and catalogue sections.

## Definition of Done

- Home, listing, product detail and categories each match `designs/Storefront Screens.dc.html` at 1280px when compared side by side, matched by `data-screen-label`.
- Filters commit through the URL and a filtered listing URL is shareable and restores its state on a hard refresh; opening the drawer issues no request.
- Each applied-filter tag's `✕` removes exactly one filter, and "Clear all" resets to the category default.
- Variant availability still disables unavailable sizes, add-to-bag is still blocked until a required variant is chosen, and both `INSUFFICIENT_STOCK` and `INVALID_VARIANT` still render their documented correction states.
- The sticky add-to-cart bar still functions on a product page containing plated imagery.
- No gradient, no filled accent block, and no solid-fill button survives on any of the four screens.
- Sold-out and low-stock cards render their designed states, verified against real catalogue data.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Cart, checkout and confirmation are Phase 10. Reviews are restyled here only where they appear on the product page; own-review CRUD behaviour is unchanged. Responsive grid ladders and the mobile sticky bar are Phase 13.
