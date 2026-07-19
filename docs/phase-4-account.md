# Phase 4 — Account Features (Wishlist, Review CRUD, Addresses)

**Objective:** deliver the signed-in account experience beyond the cart: an optimistic wishlist, create/edit/delete controls for the customer's own review, and the saved-address book required by registered checkout in Phase 5.

**Prerequisites:** Phase 3 DoD.

**API surface:** `GET /wishlist`, `PUT /wishlist/:productId`, `DELETE /wishlist/:productId`, `GET /products/:id/reviews`, `POST /products/:id/reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`, `GET /addresses`, `POST /addresses`, `GET /addresses/:id`, `PATCH /addresses/:id`, `DELETE /addresses/:id`, `PATCH /addresses/:id/default`.

## Tasks

### 4.1 Wishlist

- [ ] Build `features/wishlist` with hand-written contract types, `wishlistKeys`, an Auth-only server query for the unpaginated `GET /wishlist` response, and typed Server Actions for `PUT /wishlist/:productId` and `DELETE /wishlist/:productId`. Strip backend-only identity data before crossing a server boundary.
- [ ] Hydrate `wishlistKeys.current(userId)` from the server response for signed-in customers so product-card and product-detail hearts share one ID set. Scope the key by Clerk user ID and clear it on auth transitions so two accounts cannot share cached wishlist state in one browser.
- [ ] Implement the heart as a focused Client Component using TanStack Query v5 `useMutation`: cancel the current wishlist query, snapshot it, update optimistically, roll back on failure, and reconcile with the action result on success. Set mutation retries to `0`; a failed `PUT` with `RESOURCE_NOT_FOUND` rolls back and shows product-unavailable copy.
- [ ] Replace the Phase 1 heart placeholder on product cards and product detail. A signed-out tap opens inline `<RequireAuth>` sign-in copy without navigating away from the public product page; anonymous wishlist persistence remains unsupported.
- [ ] Build `/account/wishlist` as a thin page around a `WishlistFeature` Server Component. Render newest-first products and `addedAt`; keep `available: false` products visible but disabled and unlinked, while ACTIVE zero-stock products remain linked with a sold-out hint.
- [ ] Allow interactive wishlist reconciliation only through the same-origin `app/api/wishlist/route.ts`; the browser never calls the backend and the route never exposes a Clerk JWT.

### 4.2 Review CRUD

- [ ] Add strict Zod schemas and one Server Action per create, update, and delete mutation. Whitelist only `title` (trimmed, optional, at most 150 characters) and `ratings` (JSON number from 1–5 in 0.5 increments), then use the shared `ActionState` pipeline and revalidate the affected product/review paths.
- [ ] On the product page, render the signed-in customer's create or edit form with the shared `Form`, `FormControl`, and `SubmitButton`. Identify ownership for UI purposes by comparing `review.user.id` with the Clerk user ID; continue to treat backend `FORBIDDEN` as authoritative.
- [ ] Handle `409 REVIEW_EXISTS` using the GAP-2 fallback only: search reviews already rendered, then page through `GET /products/:id/reviews` server-side until `review.user.id` matches the Clerk user ID. Switch to edit mode when found; if the global throttle interrupts the O(pages) fallback, preserve the form and offer a manual retry. Do not invent an own-review lookup endpoint.
- [ ] Update an owned review through `PATCH /reviews/:id`; delete through `DELETE /reviews/:id` behind `ConfirmDialog`. Map `VALIDATION_ERROR` paths to the form and handle missing reviews with a refreshed product page rather than stale edit controls.
- [ ] After create, edit, or delete, revalidate the product detail, review list, and affected catalog card paths so aggregate rating changes render server-side. Preserve the documented last-review state of `ratingsAverage: null` and `ratingsQuantity: 0`.
- [ ] Treat `RESOURCE_NOT_FOUND` from review creation as an unavailable product and keep retrying `POST` after `REVIEW_EXISTS` impossible by design.

### 4.3 Addresses

- [ ] Build `features/addresses` with Auth-only, no-store server queries and one ActionState Server Action for each create, edit, delete, and set-default mutation. `/account/addresses` remains a thin page around `AddressesFeature`.
- [ ] Create a shared address form component with registered and guest modes. Registered mode supports `alias`, `country`, `governorate`, `city`, `area`, `phone`, `addressLine1`, `details`, and optional `postalCode`, `latitude`, and `longitude`; guest mode omits `alias` and all default-address controls for Phase 5 reuse.
- [ ] Mirror contract validation exactly: field length bounds, integer postal code, coordinate ranges, and Egyptian phone validation. Zod request schemas remain strict whitelists, and backend `VALIDATION_ERROR` dotted paths map back to `FormControl` errors.
- [ ] Use canonical country, governorate, and city labels shared with Phase 5 shipping lookup. Values are free text in v1 but are not case-normalized by the backend, so centralize the allowed UI labels rather than correcting them after submission.
- [ ] Preserve server ordering from `GET /addresses`: default first, then newest. Reflect that the first address is forced to default; on create only, an explicit `isDefault: true` may make a later address the default.
- [ ] Use `PATCH /addresses/:id/default` as the normal default-changing action. Do not expose a free-form `isDefault` toggle on edit, especially `false`, because that can leave the account without a default.
- [ ] Put delete behind `ConfirmDialog`. After success, revalidate the list and display the server-promoted default; never implement promotion logic in the browser.
- [ ] For any address `RESOURCE_NOT_FOUND`, preserve the deliberate missing/other-owner ambiguity, refresh `/account/addresses`, and show generic “Address not found” copy.

## Definition of Done

- Wishlist hearts update immediately on product cards and detail, roll back under a forced failed mutation, and reconcile through the same-origin wishlist route.
- `/account/wishlist` handles unavailable and zero-stock products exactly as the contract specifies; a private session receives the inline auth prompt on public hearts.
- Review create/edit/delete and the GAP-2 second-review fallback work without an invented own-review endpoint; aggregate ratings update on product cards and detail after a hard refresh.
- Address CRUD, first-address defaulting, explicit set-default, and automatic promotion after deleting the default all pass with field errors attached to inputs.
- A second signed-in browser sees server changes after refresh, while switching accounts in one browser proves wishlist IDs and address data do not leak across sessions.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Selecting an address or entering a guest shipping address during checkout (Phase 5).
