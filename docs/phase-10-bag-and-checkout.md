# Phase 10 — Bag & Checkout (S4 Cart, S5 registered, S6 guest, S7 confirmation)

**Objective:** compose the four transactional screens to their designed layouts and bring both checkout flows onto one shared step rail, without altering a single documented cart or order behaviour.

**Prerequisites:** Phase 9 DoD. **Phase 5 (checkout) and Phase 2 (guest cart) must read `done`** — this phase decomposes their largest file.

**API surface:** `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`, `POST /coupons/validate`, `GET /shipping/fee`, `POST /orders`, `POST /orders/guest`. All already implemented — **this phase adds no new call.**

**This is the risk concentration of the whole re-skin.** It is the only phase that meaningfully restructures working transactional logic, and checkout is rate-limited at 5 requests per 60 seconds with no safe retry. Treat 10.3 as its own reviewable unit.

## Tasks

### 10.1 S4 Cart

- [ ] Compose the filled cart as a `1fr / 350px` two-column layout. The left column takes a "Your bag" `h3` with a "Clear bag" ghost, a hairline, then one row per line: a 100px-wide 3:4 `.plate`, the name in Cormorant 19px with `lineTotal` right-aligned in tabular figures, a muted 12.5px variant-and-unit-price line, and a control row holding the quantity stepper, a low-stock accent tag, and a "Remove" ghost pushed right. Rows are separated by **hairlines, not cards**.
- [ ] Rebuild the quantity control on the segmented control from Phase 8, with a centred value cell at `min-width: 38px` in tabular figures. It must keep sending the **cart item `id`** to `PATCH /cart/items/:itemId` with the *replacement* quantity, never the product id and never zero — removal stays a `DELETE`.
- [ ] Compose the summary card: a coupon input with an Apply secondary, a hairline, a struck "Before discounts" line reading `totalCartPrice`, an "Items subtotal" reading `totalPriceAfterDiscount`, a "Shipping — calculated at checkout" line, a hairline, the Subtotal row (Cormorant 17px label against a 21px value), the block Checkout button at 44px, and the 11px justified note about stock reservation and seven-day guest bags.
- [ ] Render both totals **exactly from the server** and format only for display through the shared `Money` component. Show savings when the normalized decimal strings differ; perform **no client-side money arithmetic**.
- [ ] Compose the empty state in a 520px frame: a 96×120 `.plate`, an `h3`, 38ch of muted copy, and `Shop new in` plus `Track an order` actions.
- [ ] Restyle the header drawer (`cart-drawer.tsx`, `cart-drawer-line.tsx`) alongside the page. **It is a second, parallel cart UI** reading the same `cartKeys.current` entry, and leaving it un-restyled leaves an un-Classical surface reachable from every route.
- [ ] Preserve every existing behaviour: pessimistic mutations with per-line disabled states, in-flight item tracking so the non-idempotent delete cannot be replayed, `ConfirmDialog` on clear-cart and line removal, the price-drift and stock-drift notices, and the one explicit `/api/cart` recovery refetch on a `RESOURCE_NOT_FOUND` replay with the error toast suppressed.

### 10.2 The shared step rail

- [ ] Extract a presentational `CheckoutStepRail`: an uppercase 12px row at `0.1em` tracking with tabular figures, where completed steps read `01 Address ✓` in accent, the current step is underlined with a 1px accent rule, and later steps are muted.
- [ ] Extract a `CompletedStepSummary` row — a muted uppercase label, a 13.5px value line, and a "Change" ghost — sitting above a hairline. Both flows collapse their finished steps into it.
- [ ] Reuse the existing URL-driven step state. `features/checkout/hooks/use-checkout-step.ts` already wraps `useQueryStates` with `shallow: false` and already lives in the shared `checkout` feature; the guest wizard is simply its only consumer today.
- [ ] Extend `features/checkout/hooks/checkout-search-params.ts`, which currently hardcodes a guest-only enum (`GUEST_CHECKOUT_STEPS = ["contact","shipping","review"]`). The two flows need **their own step enums behind one shared rail component**, because their steps genuinely differ.

### 10.3 S5 Registered checkout — the structural change

- [ ] Decompose `features/checkout/components/registered-checkout-content.tsx` (280 lines, currently a single-page form holding a `useCart` query, a `useActionState` and six `useState` hooks) into per-step components mirroring the guest feature's file shape. **This is the largest structural change in the re-skin and sits in the highest-conflict file in the repo.** Give it its own commit and its own verification.
- [ ] **Collapse the rail to three steps: `01 Address / 02 Payment / 03 Review`.** The design's four-step rail devotes step `02 Delivery` to *two selectable delivery-option cards with separate fees*, but `GET /shipping/fee` resolves a destination to exactly one zone and returns a single `{ fee, zone }`. There is no delivery-options endpoint and no service tier in the contract. **Do not invent two courier tiers.** This is recorded as **GAP-6**; if the backend later ships options, the fourth step is added back without touching the rail component.
- [ ] Render the single computed fee as one **non-selectable** summary row rather than a radio card. Keep `shipping-estimate.tsx`'s existing server-action call and preview the fee early so `SHIPPING_NOT_AVAILABLE` never surprises at submit.
- [ ] Style the address step's selectable address cards on the `data-[selected=true]:border-primary` hook from Phase 8, with the design's custom 16px radio dot — an accent fill carrying `inset 0 0 0 4px var(--background)`. **Replace the native `accent-primary` CSS property** currently used for radios in this file and in `payment-method-select.tsx`.
- [ ] Keep the payment step CASH-only with the design's copy, "Cash on delivery — card payments coming soon". **CARD must stay disabled and never submittable**; it returns `422 PAYMENT_METHOD_UNAVAILABLE`, checked before the cart.
- [ ] Compose the summary card: line thumbnails as 48px plates with variant and line totals, the coupon input with an accent confirmation line under it, the three-row money block, a hairline, "Total so far", and the note that nothing is reserved until the order is placed.
- [ ] **Preserve the submit lock.** Checkout is throttled at 5/60s: disable the button for the whole in-flight request and show a spinner in the button rather than a page overlay. Never auto-retry.

### 10.4 S6 Guest checkout

- [ ] Keep the existing four-file wizard shape and bring it onto the shared rail from 10.2 with its own enum: `01 Contact / 02 Shipping / 03 Payment / 04 Review`. Unlike the registered flow, **the guest rail is unaffected by GAP-6** — its step `02` is the address form, which is real.
- [ ] Compose step 01 as a two-column field grid — Full name, Phone, then a full-width Email carrying the design's label, "Email — receives the receipt and your tracking link".
- [ ] Compose step 02 as a three-column field grid — Country, Governorate, City, Area, Phone at this address, optional Postal code — plus a full-width Street address and courier details, then the 12.5px fee preview row from `GET /shipping/fee`.
- [ ] Render `SHIPPING_NOT_AVAILABLE` inline under the city and governorate fields. The design pairs it with a "message the atelier" fallback, which links to `/contact` once Phase 11 lands — until then, omit the link rather than pointing at a route that does not exist.
- [ ] Close the summary card with the design's guest copy about the 30-day tracking link and claiming the order later with the same email.
- [ ] Preserve the guest identity plumbing exactly: `POST /orders/guest` carries nested `contact` and `shipping` objects and is sent with the anonymous cart identity, and a successful guest checkout **deletes** `sg_cart_session` — one of the three deletion events, which take precedence over refresh.

### 10.5 S7 Order confirmation

- [ ] Compose `features/checkout/components/order-confirmation.tsx` as the designed 760px centred column: a kicker, a 36px `h2` thanking the customer by name, a justified 56ch paragraph naming `humanOrderId` in body colour with tabular figures, a hairline, a three-column meta band (Status tag, Payment, Delivery), a hairline, the lines table with numerics right-aligned, a right-aligned 300px money block, a hairline, the claim card with a Create-account primary, then `Track this order` and `Continue shopping`.
- [ ] **Do not introduce a `/checkout/success` route.** This component is rendered inline as a success state by *both* flows — `registered-checkout-content.tsx` and `guest-checkout-wizard.tsx` — rather than being a page. The designed screen fits the existing component, and both flows pick it up from one edit.
- [ ] Read every value from the 201 response body. `totalOrderPrice = itemsSubtotal − discountApplied + shippingFees` is the server's arithmetic, not ours.
- [ ] Keep the guest claim rule from Phase 6: the response carries `claimToken: "sent-by-email"` and the real token exists only in the email. **Never fabricate or display a claim token.**
- [ ] Omit the "2–4 working days" line from the Delivery meta cell. That figure has no source field (**GAP-6**); render the destination and fee only.

### 10.6 Correction states

- [ ] Keep the reusable cart error mapping keyed by `code` and verify each surface still renders after the re-layout. Branch on `code`, never on `message`.

| Case | Where | Treatment |
|---|---|---|
| `INSUFFICIENT_STOCK` (409) | cart, checkout | inline on the offending line from `errors[] { productId, requested, available }`; never a toast alone |
| `INVALID_VARIANT` (422) | cart, checkout | disable the vanished colour/size and refetch the product |
| `CART_EMPTY` (422) | checkout | route back to the empty-cart state |
| `COUPON_*` (404/422/409) | coupon field | distinct copy per code — invalid, expired, deactivated, fully used, already used by you |
| `SHIPPING_NOT_AVAILABLE` (422) | shipping step | inline under city/governorate, previewed early |
| `PAYMENT_METHOD_UNAVAILABLE` (422) | payment step | CARD stays disabled and unsubmittable |

- [ ] Keep coupon preview on `POST /coupons/validate` (10/60s per IP) rendering its discount as an accent line under the field, labelled as an estimate revalidated at checkout.

## Definition of Done

- All four screens match `designs/Storefront Screens.dc.html` at 1280px, matched by `data-screen-label`, with the documented GAP-6 reduction applied to the registered rail.
- **A real CASH order is placed end to end as a guest and again while signed in**, both before and after the 10.3 decomposition, and both land on the designed confirmation.
- The submit button locks for the whole in-flight request in both flows, and no path auto-retries a throttled call.
- CARD is visibly present and unselectable in both flows.
- A coupon applies, displays its discount, and revalidates at checkout.
- Cart quantity changes, line removal and clear-cart all still work from **both** the `/cart` page and the header drawer, and both surfaces update from the same cache entry after each mutation.
- Guest checkout deletes `sg_cart_session`; a subsequent visit starts a fresh anonymous cart.
- Every row of the correction-state table is triggered at least once against real data.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Account order history and order detail are Phase 12. The contact route referenced by the shipping fallback is Phase 11. The second delivery option stays out until GAP-6 is answered.
