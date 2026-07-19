# Phase 2 — Guest Cart

**Objective:** complete anonymous cart behavior through the all-server BFF, with a correct `X-Cart-Session` lifecycle, server-authoritative cart data, same-origin interactive refetches, and a cart that remains consistent across product detail, Header drawer, and `/cart`. This is the storefront’s riskiest contract surface and must follow `05-cart.md` exactly.

**Prerequisites:** Phase 1 Definition of Done; product detail already provides the selected color, size, and quantity.

**API surface:** `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, and `DELETE /cart`. All use Optional auth and are never cached.

## Session token lifecycle

1. Server code passes `cartSession: true` on every cart-aware `apiFetch` call; `apiFetch` reads the one allowed cart cookie, `sg_cart_session`, and attaches its value as `X-Cart-Session` when present.
2. **Capture whenever present:** every write-capable cart response path inspects `data.sessionToken`, regardless of endpoint or whether a token was expected. When present, call `setCartSession()` before returning and strip `sessionToken` from the client-visible payload.
3. **Refresh after successful anonymous mutations:** if a successful anonymous cart-aware mutation response omits `sessionToken` and the request used an existing cookie token, call `setCartSession()` again with that stored token. This issues a fresh seven-day `maxAge` that mirrors the backend cart's sliding `expiresAt`. A returned token wins; if neither a returned nor stored token exists, do nothing. Do not refresh after failures, signed-in mutations, or pure Server Component reads.
4. `sg_cart_session` is our BFF cookie: `httpOnly: true`, `secure: true`, `sameSite: "lax"`, `path: "/"`, `maxAge: 7 days`. Browser code never reads it and never calls the backend origin.
5. Explicitly delete `sg_cart_session` on exactly three successful events: the post-sign-in `GET /cart` merge (Phase 3), `POST /orders/guest` checkout (Phase 5), and anonymous `DELETE /cart` clear (this phase). Do not delete it on sign-out, an empty read, line removal, a failed mutation, or a recoverable 404. These deletion events take precedence over refresh.
6. Never include the token in a URL, log, analytics event, React props, RSC payload, TanStack cache entry, Server Action result, or same-origin Route Handler JSON.
7. Anonymous backend carts expire after seven days of inactivity. If an expired identity reads `GET /cart`, accept the documented virtual empty cart (`id: null`) and let the cookie’s own lifetime end; do not invent a special error flow.

## Tasks

### 2.1 Cart feature core and server boundaries

- [ ] Hand-write `Cart`, `CartItem`, live cart-product, virtual-empty-cart, pagination-free response, structured stock error, and structured variant error types from `05-cart.md` and `00-conventions.md`. Keep all price/totals fields as decimal strings and `id`/`expiresAt` nullable where documented.
- [ ] Add `features/cart/queries/get-cart.ts`: call `GET /cart` through `apiFetch` with `auth: "optional"`, `cartSession: true`, and `cache: "no-store"`; `apiFetch` owns both identity headers. Return a sanitized cart with no `sessionToken` property.
- [ ] Implement four interactive Server Actions in separate files: add item, replace quantity, remove line, and clear cart. Each uses a Zod whitelist, calls the documented route through `apiFetch`, applies the capture-whenever-present and successful-anonymous-refresh rules before sanitizing, revalidates `/cart`, and returns `Promise<CartActionResult>` as either a typed complete cart or serializable `{ error: { code, message, errors } }`; this interactive result style is not `ActionState` and never throws an expected API error.
- [ ] Keep coupon preview out of this phase. Document that the fifth cart-aware action, for `POST /coupons/validate`, is added in Phase 5 and must reuse the same cookie/header and sanitized-result rules rather than introducing a second client path.
- [ ] On successful anonymous `DELETE /cart`, call `clearCartSession()` and return the documented virtual empty cart to interactive callers. A signed-in clear must not create or delete a guest cookie.
- [ ] Centralize writable cart-response handling so every Action and Route Handler captures any returned token, or re-writes the stored token after a successful anonymous mutation when none is returned, before removing it. A pure RSC read must still strip an unexpected token and must never attempt a cookie write from a render context. Successful merge, guest checkout, and anonymous clear use their deletion rule instead of refresh.

### 2.2 TanStack cart state and same-origin refetch

- [ ] Define `cartKeys.current` and `useCart(initialData?)` with `staleTime: 30_000` and `refetchOnWindowFocus: true`. The root layout server-reads the current cart and passes it through `Providers` as initial data; pages remain RSC-first.
- [ ] Add `app/api/cart/route.ts` only as the thin TanStack refetch boundary. Its `GET` reads server cookies/session, calls backend `GET /cart`, applies the same capture/sanitize rule in a cookie-write-capable context, returns only the cart, and disables caching.
- [ ] Make the `useCart` query function fetch only same-origin `/api/cart`. It must never receive the backend URL, Clerk JWT, `X-Cart-Session`, or `sessionToken`.
- [ ] Add `useMutation` hooks for the four Server Actions. Mutation retry stays disabled; success always calls `queryClient.setQueryData(cartKeys.current, cart)` with the returned complete cart and never uses invalidate-and-refetch as the normal success path.
- [ ] Keep cart mutations pessimistic in v1. Disable the affected control and show a per-line pending state until the server returns; do not fabricate stock, price, totals, or a temporary cart.

### 2.3 Add to cart from product detail

- [ ] Turn the Phase 1 selectors into the add-item control. Require a color when the product’s color array is non-empty, a size when its size array is non-empty, and an integer quantity with a minimum of 1; zero is never sent.
- [ ] Submit only `productId`, `quantity`, and selected `color`/`size` through the add-item Server Action. On success, update the cart cache directly, show a Sonner success message, and let the Header badge/drawer update from the same cache entry.
- [ ] For `INSUFFICIENT_STOCK`, use `errors[] { productId, requested, available }` to show “Only N available” beside the quantity control; never parse the human-readable message.
- [ ] For `INVALID_VARIANT`, keep the selection visible, refresh the RSC product data with `router.refresh()`, and require a valid re-selection. For `RESOURCE_NOT_FOUND`, render the product-unavailable path.

### 2.4 Cart drawer, cart page, and badge

- [ ] Replace the Header placeholder with a base-ui `Sheet` cart drawer fed only by `useCart()`: item count, compact lines, server totals, empty state, link to `/cart`, and accessible title/focus behavior.
- [ ] Implement `/cart` as a thin RSC page that passes its server-read cart to `CartFeature`; interactive line controls consume the same `cartKeys.current` initial data rather than issuing a second initial request.
- [ ] Render each line’s image, product link, nullable variant chips, stored price, server `lineTotal`, and a quantity control that sends the cart item `id` to `PATCH /cart/items/:itemId`, never the product ID.
- [ ] Render `totalCartPrice` and `totalPriceAfterDiscount` exactly from the server and format only for display. Show savings when the normalized decimal strings differ; perform no client-side money arithmetic.
- [ ] Detect price drift by decimal-normalized comparison of line `price` and live `product.priceAfterDiscount`; show a semantic “Price updated” notice without recomputing totals. Detect stock/status drift from live `quantity` and `status` and offer correction/removal UI.
- [ ] Put clear-cart and destructive line removal behind `ConfirmDialog`. Disable duplicate submits and track in-flight item IDs so the non-idempotent delete cannot be replayed by repeated clicks.
- [ ] If a remove replay or stale line returns `RESOURCE_NOT_FOUND`, treat it as already removed, perform one explicit `/api/cart` recovery refetch, replace `cartKeys.current`, and suppress an error toast. Do not automatically retry the delete.
- [ ] Derive the Header badge by summing line quantities from `cartKeys.current`; do not duplicate cart state in another store. The drawer, page, and product detail must update together after each successful Action.

### 2.5 Structured correction states

- [ ] Add reusable cart error mapping keyed by `code`. Map `INSUFFICIENT_STOCK.errors[]` back by `productId` and show requested/available quantities on matching rendered lines.
- [ ] Preserve structured `INVALID_VARIANT.errors[] { productId, color, size, code }` for checkout correction UI and map it back to the matching variant line; the add-item form uses its product refresh/re-selection behavior when that error has no line payload.
- [ ] Guard all client-known validation constraints before submission, but surface unexpected `VALIDATION_ERROR` fields as implementation defects without losing the current cart or selection.

## Error handling matrix

| Code | Route | Web behavior |
|---|---|---|
| `INSUFFICIENT_STOCK` | add / quantity replace | inline available quantity from structured `errors[]`; keep the last server cart |
| `INVALID_VARIANT` | add | refresh product RSC data and require re-selection |
| `RESOURCE_NOT_FOUND` | add | product unavailable state |
| `RESOURCE_NOT_FOUND` | quantity replace / line delete | one sanitized same-origin cart refetch; stale line disappears without replaying delete |
| `VALIDATION_ERROR` | any mutation | render field/control feedback; record as a bug when client guards should have prevented it |
| `RATE_LIMITED` | any mutation | preserve controls/cart, stop retries, and allow a later manual attempt |

## Definition of Done

- Signed out: add an item, hard refresh, and open a new tab; the same cart and badge persist through `sg_cart_session`.
- After each successful signed-out add, quantity replace, or line removal, the browser cookie receives a fresh seven-day `maxAge` even when the backend response omits `sessionToken`; failed and signed-in mutations do not refresh it.
- An incognito window starts with a separate virtual empty cart and cannot see the first window’s lines.
- Browser developer tools show `sg_cart_session` as HttpOnly; `document.cookie`, RSC payloads, same-origin JSON, Server Action results, URLs, and logs contain no `sessionToken` value.
- Quantity replace, line removal, anonymous clear, duplicate-click suppression, and the non-idempotent-delete recovery path match the error matrix.
- Every successful mutation replaces `cartKeys.current` with the returned complete cart; drawer, page, and Header badge stay synchronized without invalidate-and-refetch.
- Totals remain server strings after every mutation. Price drift and stock drift are verified by changing the product through the admin in a second browser, then focusing or explicitly refreshing the storefront cart.
- `bun lint` and `bunx tsc --noEmit` are green.

## Out of scope

Clerk session activation and cart merge (Phase 3), coupon preview and checkout (Phase 5), wishlist, and client-side money estimates.
