# Phase 5 — Checkout (Shipping, Coupons, Registered + Guest)

**Objective:** convert guest and registered carts into orders through server-mediated, CASH-only checkout, with truthful server-provided previews, one guarded submit, and precise recovery for every documented failure.

**Prerequisites:** Phase 4 DoD for saved addresses and the reusable address form; Phase 2 DoD for guest carts. Work may overlap internally: 5.1–5.2, then 5.3 and 5.4 in either order, then 5.5–5.6.

**API surface:** `GET /shipping/fee`, `POST /coupons/validate`, `GET /cart`, `POST /orders`, `POST /orders/guest`.

## Tasks

### 5.1 Shipping estimate

- [ ] Add a server-only shipping query for `GET /shipping/fee` using exact `country`, `governorate`, and optional `city` wire parameters. Keep it no-store and call it through a Server Action when a saved address or guest destination changes; do not add shipping state to TanStack Query.
- [ ] Display `fee` through `formatEGP()` and identify whether the returned city-specific or governorate-wide zone won. Label it as an estimate and never synthesize a checkout grand total; the completed order response owns the final `shippingFees` and `totalOrderPrice` strings.
- [ ] Map `SHIPPING_NOT_AVAILABLE` to the address step, block continuation, and preserve entered or selected address state so the customer can correct the destination before review.

### 5.2 Coupon preview

- [ ] Build `validateCouponAction` for `POST /coupons/validate`: strict Zod whitelist, trimmed/uppercased `code` matching `^[A-Z0-9_-]{3,30}$`, and optional normalized guest `email`. The server reads `sg_cart_session`, adds `X-Cart-Session` for guests, and adds a fresh Clerk JWT when signed in; neither identity value reaches client code.
- [ ] Use TanStack Query v5 `useMutation` only for the preview interaction, with retry `0` and the 10/60s limit reflected in pending/rate-limit UX. Render only the returned `itemsSubtotal` and `discountApplied` strings; coupons never discount shipping and no amount is calculated in the browser.
- [ ] Show distinct code-based copy for unknown `RESOURCE_NOT_FOUND`, `COUPON_EXPIRED`, `COUPON_INACTIVE`, `COUPON_EXHAUSTED`, and `COUPON_USER_LIMIT`. Never branch on the backend message.
- [ ] Keep a successful preview as interactive checkout state, not cart truth. Submit the normalized `couponCode` for atomic revalidation during order creation and preserve it when a 429 or unrelated checkout error occurs.
- [ ] Treat coupon validation as cart-aware but never as a fourth cookie-deletion event. Delete `sg_cart_session` on exactly three events: successful merge after post-sign-in `GET /cart`, successful `POST /orders/guest`, and successful anonymous `DELETE /cart`.

### 5.3 Guest checkout flow

Route `/checkout/guest`: contact → shipping address → review → placed.

- [ ] Build strict schemas for `contact.name`, `contact.phone`, `contact.email`, the contract's nested `shipping` fields, `paymentMethod`, optional `couponCode`, and optional `notes` up to 1000 characters. Reuse Phase 4's address form in guest mode and map dotted validation paths such as `contact.email` to inputs.
- [ ] Recompute `GET /shipping/fee` server-side whenever the canonical country, governorate, or city changes, and prevent review while the destination is incomplete or unsupported.
- [ ] Render review lines and cart totals from the live cart response, coupon preview strings from its own response, and shipping estimate from its own response. Do not combine them with browser arithmetic; order creation may reprice every line.
- [ ] Implement `placeGuestOrderAction` for `POST /orders/guest`. The server attaches `X-Cart-Session`, returns expected failures as `ActionState`, uses `SubmitButton` pending state for a single-submit guarantee, and never automatically retries the 5/60s mutation.
- [ ] On success, show `humanOrderId` and the literal `claimToken: "sent-by-email"` marker with “We emailed your order tracking link to …”; never expect or expose the real token. Call `clearCartSession()` only after the successful response, set `cartKeys.current` to the canonical empty cart, and revalidate `/account/orders`.

### 5.4 Registered checkout flow

Route `/checkout`: saved address → review → placed.

- [ ] Keep the page a Server Component and auth-aware. Signed-out customers receive an inline choice to sign in or continue at `/checkout/guest`; signed-in customers load saved addresses and cart data server-side.
- [ ] On entry, complete the required post-sign-in `GET /cart` with both identities when `sg_cart_session` exists. Capture any response `sessionToken` server-side, strip it from returned data, and delete `sg_cart_session` only after a successful merge response.
- [ ] Render saved addresses with the default preselected and an inline create form reusing Phase 4. A selection change recomputes the server-side shipping estimate; a second-session address deletion is reconciled before retry.
- [ ] Implement `placeOrderAction` for `POST /orders` with only `shippingAddressId`, `paymentMethod`, optional `couponCode`, and optional `notes`. On success, return the safe order ID/`humanOrderId` in `ActionState`, replace the cart query with the canonical empty shape, call `revalidatePath("/account/orders")`, and render confirmation with a link to `/account/orders/[id]`.

### 5.5 Failure recovery (both flows)

- [ ] Build one server-side `CheckoutErrorResolver` that maps `ApiError` into an ActionState-safe serializable projection containing the target step, code, field/line annotations, and customer copy. Never serialize an `ApiError` instance to the browser; both checkout actions use the same resolver.
- [ ] Map `INVALID_VARIANT` entries by `productId`, `color`, and `size`, and `INSUFFICIENT_STOCK` entries by `productId`, `requested`, and `available`. Refresh cart state only through `app/api/cart/route.ts`, annotate the affected lines, and let the customer fix or remove them.
- [ ] Map `CART_EMPTY` to the cart, `SHIPPING_NOT_AVAILABLE` to the address step, each coupon code to the review step, and `PAYMENT_METHOD_UNAVAILABLE` to the payment selector. A registered `RESOURCE_NOT_FOUND` reconciles both saved addresses and coupon state because the code alone does not distinguish them.
- [ ] On `429 RATE_LIMITED`, preserve every field, selected address, preview, and cart line, show retry guidance, and leave mutation retry disabled. On any checkout failure, state that nothing was reserved or charged.

### 5.6 Payment method abstraction

- [ ] Render payment choices from a shared config seam: `CASH` enabled and `CARD` visible but disabled with “Coming soon” copy. The schema prevents disabled methods from being submitted; `PAYMENT_METHOD_UNAVAILABLE` remains handled as defense in depth.
- [ ] Keep future CARD work behind the config seam without inventing a payment-session request. Enabling the UI is a flag change, but real CARD ordering still requires a future backend contract.

## Definition of Done

- Guest happy path passes in a private session: browse → cart → `/checkout/guest` → order confirmation; the email arrives with the public tracking URL, `sg_cart_session` is gone, and client cart state is empty.
- Registered happy path passes after sign-in merge: saved address → coupon preview → order placement → confirmation → `/account/orders/[id]`; every displayed amount is a server string formatted with `formatEGP()`.
- Rapid double-clicking the submit control produces exactly one order request and one order; forced 429 responses preserve the complete form and cart.
- Every documented checkout failure is exercised: all coupon states, empty cart, unsupported shipping, unavailable payment, and stock/variant changes driven from a second browser against the admin app; a price change proves confirmation uses the newly returned server strings.
- Refreshing midway through checkout never loses or duplicates server cart lines, and a stale address or coupon can be corrected without restarting the flow.
- Browser network inspection confirms the backend is never contacted directly and no Clerk JWT or `sg_cart_session` value enters a client-visible response.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Order history, tracking, claiming, and cancellation (Phase 6); real CARD payment until a future backend contract exists.
