# Phase 1 — Catalog (Products, Categories, Public Reviews)

**Objective:** a guest can browse the complete storefront catalog through a server-rendered home page, category tree and landing pages, a filtered/sorted/paginated product listing, full product details with a gallery, and read-only public reviews. Every backend call in this phase is Public.

**Prerequisites:** Phase 0 Definition of Done.

**API surface:** `GET /products`, `GET /products/:slug`, `GET /categories`, `GET /categories/:slug`, and `GET /products/:id/reviews`.

## Tasks

### 1.1 Categories feature

- [ ] Create hand-written category and sub-category response types from `02-categories.md`; preserve nullable `imageUrl`, the unpaginated tree, ACTIVE-product counts, and slug fields.
- [ ] Add thin `features/categories/queries/get-categories.ts` and `get-category.ts` functions that call Public `apiFetch`, use `next: { revalidate: 300, tags }`, and contain no business rules. Use React `cache()` where the page and metadata need the same request result.
- [ ] Implement `CategoriesFeature` for `/categories`: a responsive, server-rendered category tree with optimized images, `productCount` hints, nested sub-categories, empty/error states, and links using category/sub-category slugs rather than IDs.
- [ ] Implement the `/categories/[slug]` landing page as a thin page over `CategoryFeature`. Await the Next 16 `params` Promise, render category context plus its product listing, and use `notFound()` only for `RESOURCE_NOT_FOUND`.
- [ ] Add `generateMetadata` for category detail using live name/image data, with a safe unavailable fallback and no duplicate client request.

### 1.2 Products feature — list and URL state

- [ ] Create product-card, product-detail, gallery, and pagination types directly from `01-products.md`; keep all money and rating decimals as strings and `ratingsAverage` nullable.
- [ ] Add thin `features/products/queries/get-products.ts` and `get-product.ts` functions. Public list/detail requests use `next: { revalidate: 60–300, tags }`; no query sends Clerk or cart headers.
- [ ] Create `features/products/hooks/use-products-params.ts` as the one products parameter schema feeding both `createSearchParamsCache` and `useQueryStates({ shallow: false })`. Cover the exact wire names `search`, `category`, `subCategory`, `minPrice`, `maxPrice`, `sizes`, `colors`, `featured`, `sort`, `page`, and `limit`.
- [ ] Serialize `sizes` and `colors` as trimmed CSV values, cap trimmed search at 100 characters, validate non-negative two-decimal price bounds, constrain sort to `newest | price_asc | price_desc | best_selling | top_rated`, and reset `page` to 1 when a filter or sort changes.
- [ ] Make `/products` a thin RSC page that awaits the `searchParams` Promise, parses it through the server cache, calls `GET /products`, and renders a responsive `ProductCard` grid. Page data must never load through an effect or browser request.
- [ ] Build client filter/search controls that change only nuqs URL state with `shallow: false`: debounced search, category/sub-category, price range, size/color multi-select, featured toggle, sort, clear-all, and accessible sheet behavior at narrow widths.
- [ ] Render numbered server-side pagination from `meta.page`, `totalPages`, `hasNext`, and `hasPrev`; use links/query-state navigation, not infinite scrolling. Preserve all active wire-format filters in every page URL.
- [ ] Product cards show optimized image, name, `formatEGP()` price, original price only when discounted, nullable rating state, semantic low-stock/sold-out badges, and a usable detail link even when stock is advisory zero.

### 1.3 Product detail and gallery

- [ ] Implement `/products/[slug]` as a thin page over `ProductFeature`; await `params` and `searchParams`, fetch the detail in an RSC query, and render real product content in the initial HTML.
- [ ] Build a responsive gallery island from the server-provided images ordered by `sortOrder`. Use `next/image`, tolerate null gallery URLs with a stable fallback, provide keyboard-accessible thumbnails and controls, and configure only the documented Cloudinary host in `next.config.ts` `remotePatterns`.
- [ ] Render name, description, `formatEGP()` price block, category/sub-category slug links, size/color selectors as local interaction state for Phase 2, quantity/stock hints, and the rating summary. A null rating says “No reviews yet,” never zero stars.
- [ ] Handle `RESOURCE_NOT_FOUND` with the route not-found state and no stale client detail entry. Add `generateMetadata` from the same cached server query for title, description, and available product image.
- [ ] Verify decimal-string display for `"2400"`, `"2040.5"`, and `"65.00"`; comparison and formatting must not use floating-point price arithmetic.

### 1.4 Public reviews — read only

- [ ] Create review types and `features/reviews/queries/get-product-reviews.ts` from `03-reviews.md`. Call `GET /products/:id/reviews` as Public with `page`/`limit`, short revalidation, and pagination tags.
- [ ] Render the first review page inside product detail, followed by numbered server-side review pagination driven by a reviews nuqs schema with wire-format `page` and `limit`; navigation rerenders the RSC section with `shallow: false`.
- [ ] Show title, decimal-string rating, reviewer display name, and formatted creation date. An unknown product ID returning an empty page is a normal “No reviews” state, not a 404.

### 1.5 Home storefront

- [x] Replace the Phase 0 smoke list with `HomeFeature`: a server-rendered hero, category shortcuts, a featured rail from `GET /products?featured=true&limit=10`, and a newest rail from `GET /products?sort=newest&limit=10`.
- [x] Reuse category/product queries and cards; fetch independent rails in parallel, support accessible horizontal overflow at narrow widths, and avoid bespoke endpoints or duplicated response types.
- [x] Add home loading and partial-failure boundaries so one unavailable rail does not erase the rest of the public storefront.

## Error handling matrix

| Code | Where | Web behavior |
|---|---|---|
| `RESOURCE_NOT_FOUND` | product or category detail | route not-found/unavailable UI; do not retain stale client detail data |
| `VALIDATION_ERROR` | product or review URL params | normalize invalid URL state to documented defaults; record as an implementation defect if a validated request still fails |
| `RATE_LIMITED` | any list/detail | preserve the current URL and show a retry with backoff |
| network / 5xx | any RSC section | route or section error boundary with retry; never replace the URL state |

## Definition of Done

- A guest can navigate home → category tree → category landing → filtered product list → product detail → public reviews at wide and narrow viewport widths.
- Filter, sort, page, and limit URLs are shareable: hard refresh and a new tab restore the exact result, and browser back/forward restores prior state.
- Live-data checks confirm filter AND semantics, any-match size/color behavior, and unrated products appearing last for `top_rated`.
- Product detail view-source contains the real product name, description, price, and review summary rather than a client loading shell.
- Numbered pagination is derived from backend `meta`; there is no infinite-scroll or client-side page-data request.
- Prices with missing, one-digit, or two-digit fractional scales render consistently via `formatEGP()`.
- `bun lint` and `bunx tsc --noEmit` are green.

## Out of scope

Add to cart (Phase 2), wishlist interaction (Phase 4), review creation/edit/delete (Phase 4), and any catalog mutation.
