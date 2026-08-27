# Backend Contract Gaps — Questions & Requests

> **Audience:** backend team (`sg-couture-api`).
> **Source:** web storefront dev-plan review against `docs/integration/storefront/` (contract snapshot dated 2026-07-18), plus a second pass reviewing the approved UI design in `docs/design_handoff_sg_storefront/` against the same contract (2026-08-24).
> **Status:** open — each item lists what blocks us, what we need, and our fallback if the contract stays as-is.
>
> Resolutions should land as updates to the integration guide (and `API_SPECIFICATION.md` where behavior changes), then this file gets updated/pruned.

---

## GAP-1 · Expired guest cart: is a new `sessionToken` minted?

**Blocks:** Phase 2 (guest cart). **Severity: high** — silent cart loss if we guess wrong.

**Contract today:** `00-conventions.md` says the **first** anonymous `POST /cart/items` returns `sessionToken` once, and later responses omit it. Anonymous carts expire 7 days after the last mutation.

**The undefined case:** the storefront's Next server still holds a token whose cart has expired (or was deleted). The next `POST /cart/items` creates a cart lazily — but under which identity?

- If the server **reuses the presented `X-Cart-Session` token**, the token value stays valid, but the Next server must still re-write its cookie after each successful anonymous cart-aware mutation so the browser's seven-day `maxAge` slides with the backend cart's `expiresAt`.
- If the server **mints a new token**, the response now contains a `sessionToken` that is *not* the browser's first mutation. A storefront that only captures the token "once" misses it, and every subsequent call references a dead cart → the customer's cart silently vanishes on every add.

**What we need:**

1. A sentence in `05-cart.md` / `00-conventions.md` specifying the behavior when `X-Cart-Session` references a nonexistent/expired cart, for each of `GET /cart`, `POST /cart/items`, and the other mutations.
2. If a new token can be minted: confirmation that `sessionToken` appears in the response **whenever the acting token changes**, not only on the literal first-ever mutation.

**Our fallback (defensive, implemented regardless):** the Next server captures `sessionToken` from **any cart Server Action response** that contains one and overwrites our httpOnly `sg_cart_session` cookie — the **capture-whenever-present** rule. After every successful anonymous cart-aware mutation that returns no new token, it re-writes the stored token with `setCartSession()` to refresh the cookie's seven-day `maxAge`; failed and signed-in mutations do not refresh it. It deletes that cookie on exactly three successful events: implicit merge after the post-sign-in `GET /cart`, guest checkout, and anonymous cart clear, and those deletions take precedence over refresh. Please confirm this is safe and sufficient.

---

## GAP-2 · `REVIEW_EXISTS` recovery: no way to fetch the user's own review

**Blocks:** Phase 4 (review CRUD). **Severity: medium** — feature works but has a broken edge on popular products.

**Contract today:** `POST /products/:id/reviews` returns `409 REVIEW_EXISTS`, and `03-reviews.md` says to use the existing review's `id` with `PATCH /reviews/:id`. But there is no endpoint that returns the current user's review for a product. The only source is the **public paginated list** (`GET /products/:id/reviews`, 20/page, newest first) — on a product with many reviews, the user's review can sit pages deep.

**What we need (either one):**

- **Preferred:** a lightweight owned-review lookup, e.g. `GET /products/:id/reviews/me` → the caller's review or 404. Auth mode: Auth.
- **Alternative:** a `mine=true` filter on the existing list route, or include the caller's review `id` in the `409 REVIEW_EXISTS` error payload (a structured `errors: [{ reviewId }]` line would be enough).

**Our fallback:** on 409, page through the review list matching `user.id` against the Clerk user id. Works, but is throttle-unfriendly (100 req/60s global) and O(pages) on popular products; we'd rather not ship it.

---

## GAP-3 · Checkout preview subtotal: confirm `cart.totalPriceAfterDiscount ≡ itemsSubtotal`

**Blocks:** nothing hard — Phase 5 (checkout review step). **Severity: low** — terminology/invariant confirmation.

**Contract today:** the checkout review screen must show an items subtotal before any coupon is applied. `itemsSubtotal` exists only in the coupon-validate response ("cart total **after product discounts**, before the coupon") and in the order response. The cart shape exposes `totalPriceAfterDiscount` (recomputed from live prices on every mutation).

**What we need:** one sentence in `05-cart.md` or `06-coupons.md` confirming that for the same cart state, `cart.totalPriceAfterDiscount` equals coupon-validate/order `itemsSubtotal` — i.e. the storefront may render `totalPriceAfterDiscount` as the "Subtotal" line when no coupon has been previewed. If any case breaks the equality (rounding, scale, timing), document it.

**Our fallback:** display `totalPriceAfterDiscount` as the subtotal until a coupon preview/order response supplies `itemsSubtotal`, then prefer the server's value. No client arithmetic either way.

---

## GAP-4 · Order detail contains no shipping address

**Blocks:** Phase 12 (account area). **Severity: high** — *escalated 2026-08-24.*

> **Escalation note.** This was previously "nothing blocked — Phase 6 renders an address-free detail by design; severity: product decision needed." The approved design now **depends** on this data: screen S13 (Order detail) specifies a two-column band reading `DELIVERING TO` (full address plus a muted phone) and `NOTE FOR THE COURIER` (the `notes` value, set in italic). The storefront will ship S13 with that band omitted until the contract answers, but the designed screen is incomplete without it.

**Contract today:** the order detail shape (`09-checkout.md`, reused by `GET /orders/:id` and `GET /orders/guest/:token`) has items, totals, status, payment fields — but **no shipping address and no contact/notes**. Customers therefore can never see *where* an order is being delivered, and support conversations ("which address did I use?") have no storefront answer. Deleting a saved address also severs the order's address relation (`08-addresses.md`), so the data may genuinely be gone unless it's snapshotted.

**What we need:** a decision, then contract text:

1. Is the shipping destination snapshotted on the order server-side? (If not, that's the prerequisite.)
2. If yes: add a read-only `shippingAddress` (and ideally `notes`, and `contact` for guest orders) block to the detail shape, or explicitly document that the storefront intentionally never exposes it.

**Our fallback:** ship Phase 6 as planned (no address shown). UI copy avoids implying the address is viewable.

---

## GAP-5 · No contact / message endpoint

**Blocks:** Phase 11 (contact and order help). **Severity: medium** — half of a designed screen has nowhere to submit.

**Contract today:** there is no contact, message, enquiry, or support endpoint anywhere in `docs/integration/storefront/`. There is also no newsletter-subscribe endpoint (already known; the storefront ships that control visibly disabled rather than faking it).

**What the design needs:** screen S9 (Contact us) specifies a "Write to us" form with `name`, optional `phone`, `email`, a single `topic` chosen from six fixed values (A piece I want · Sizing & fit · Alterations · Delivery · Returns · Something else), and a free-text `message`. **Three separate surfaces depend on this one endpoint**, so it is worth resolving once:

1. S9's contact form.
2. S13's "Message the atelier" secondary button on the order-detail rail.
3. The `SHIPPING_NOT_AVAILABLE` recovery path, which the design wants to end in a "message the atelier" fallback.

**What we need:**

- **Preferred:** `POST /contact` — Auth mode **Optional** (so a signed-in customer's identity can be attached server-side without the form asking for it again), body `{ name, email, phone?, topic, message, orderId? }`, strict-body like every other route. It needs its own rate limit; something near the coupon-validate tier (10/60s per IP) is sensible, and it should be lower than the 100/60s global because it is an unauthenticated write that sends mail.
- Confirmation of the topic enum's canonical values, so the storefront sends wire-format strings rather than inventing labels.
- If a `VALIDATION_ERROR` shape differs from the standard envelope for this route, document it.

**What shipped:** the designed S9 form renders and validates client-side with Zod, then hands the composed message to the customer's own mail client via a `mailto:` link (topic in the subject, message in the body) with a WhatsApp deep link beside it — "WhatsApp on the same number" as promised. The primary control is a link, not a submit; a visible note says the message opens in the customer's mail app. **No server action and no success state we cannot prove.** The `SHIPPING_NOT_AVAILABLE` recovery path (surface 3) now also links to `/contact` from both the guest and registered checkout flows. Surface 2 — S13's "Message the atelier" button — is still pending Phase 12, which will link it to `/contact` the same way. This works, but it loses delivery confirmation, loses the message in our own systems, and drops the attach-signed-in-identity behaviour entirely.

---

## GAP-6 · Delivery options and delivery-time estimates are not in the contract

**Blocks:** Phase 10 (checkout). **Severity: medium** — the design shows a choice the API cannot offer, and a promise the API cannot substantiate.

**Contract today:** `GET /shipping/fee` resolves a destination to **one** zone and returns a single fee:

```json
{ "fee": "65.00", "zone": { "country": "Egypt", "governorate": "Cairo", "city": null } }
```

There is no set of options, no service tiers, and **no duration, ETA, or working-day estimate anywhere in the shipping or checkout responses.**

**Two distinct problems:**

1. **Selectable delivery options.** Screen S5 (registered checkout) devotes its entire step `02 Delivery` to *two selectable cards*, each with a name, a sub-line and its own fee right-aligned. Nothing in the contract can populate a second row. We are not going to invent courier tiers.
2. **Delivery-time copy.** The design states delivery duration as fact in at least four places — S3's PDP row ("Cairo, 2–4 days · 65 EGP"), S6's guest shipping step, S7's confirmation meta band ("Nasr City, Cairo · 2–4 working days"), and S13's timeline estimate ("2–4 working days"). That figure has no source field. Hardcoding a shipping promise in the frontend is exactly the kind of claim that should be server-owned and per-zone. S9's Contact page delivery blurb deliberately omits any day-range estimate for the same reason.

**What we need (either, ideally both):**

- **For (1), preferred:** confirmation that a single fee is the intended model for v1, so we can collapse the step. If multiple delivery options *are* planned, we need the shape before building the step — e.g. `GET /shipping/options?country=&governorate=&city=` returning an array of `{ id, name, description, fee, estimatedDays }`, with the chosen `id` accepted by `POST /orders` and `POST /orders/guest`.
- **For (2):** add an estimate to the existing zone payload — `zone.estimatedDaysMin` / `estimatedDaysMax`, or a preformatted `estimatedDelivery` string — so the storefront renders a server-owned promise instead of a hardcoded one.

**Our fallback:** collapse the registered checkout rail from the designed four steps to `01 Address / 02 Payment / 03 Review`, and render the single `GET /shipping/fee` result as one **non-selectable** summary row. For the duration copy, omit the day range entirely rather than hardcode it — the design's delivery rows degrade to fee-only. The guest rail is unaffected, because its step `02` is the address form, which is real.

---

## GAP-7 · No receipt document or receipt re-send endpoint

**Blocks:** Phase 12 (account area). **Severity: low** — one designed card is dropped.

**Contract today:** `09-checkout.md` notes that a successful checkout "sends a confirmation email", but there is no endpoint to retrieve a receipt document and none to re-send that email. `10-orders.md` exposes no receipt or invoice field.

**What the design needs:** S13 (Order detail) closes its right rail with a **Receipt** card offering `Download PDF` and `Email again`.

**What we need (either):**

- `GET /orders/:id/receipt` returning a PDF (Auth), with a guest equivalent keyed on the tracking token; and/or
- `POST /orders/:id/receipt/email` to re-send the confirmation mail, rate-limited (this is a mail trigger, so tighter than global).
- If receipts are deliberately email-only and never retrievable, say so in `10-orders.md` and we will drop the card permanently.

**Our fallback:** omit the Receipt card. **We will not ship dead buttons** — an inert "Download PDF" is worse than no card at all.

---

## GAP-8 · Order lines carry `productId` but the catalogue is addressed by `slug`

**Blocks:** Phase 12 (account area). **Severity: medium** — two designed actions cannot be wired.

**Contract today:** an order item is:

```json
{ "productId": "ckvprod123", "name": "…", "imageUrl": "…", "quantity": 2,
  "color": "Black", "size": "M", "price": "552.50", "lineTotal": "1105.00" }
```

But product detail is **`GET /products/:slug`** — there is no `GET /products/:id`, and no lookup that turns a `productId` into a slug. The storefront's product route is `/products/[slug]` to match.

**What the design needs:** S13 gives every order line a `View piece` and a `Buy again` ghost action, and S12 puts `Buy again` on delivered and cancelled order cards. All of them need to reach the product page or re-add to cart from an order line, and none of them can.

**What we need (any one, cheapest first):**

- **Preferred:** add `slug` to the order item shape. It is a snapshot-friendly field and costs one column.
- **Alternative:** accept an id at the detail route (`GET /products/:idOrSlug`), or add a slug-resolution lookup.
- Note that `POST /cart/items` takes `productId`, so **"Buy again" as a pure cart re-add already works** — it is only the *link to the product page* that is blocked. If the answer is "no slug", we would keep `Buy again` and drop `View piece`.

**Our fallback:** render `Buy again` (it only needs `productId`) and omit `View piece` from order lines. The order line's product name and image stay unlinked.

---

## GAP-9 · No filter-facet source for the product listing

**Blocks:** Phase 9 (catalogue surfaces). **Severity: low** — works today, but the filter UI is lying by omission.

**Contract today:** `GET /products` accepts `sizes` and `colors` as CSV filters, and each product in the list response correctly carries its own `sizes: []` and `colors: []` arrays. What does **not** exist is any endpoint describing *which* sizes and colours are available — globally, or within a category.

**Consequence:** the storefront currently hardcodes `SIZE_OPTIONS` and `COLOR_OPTIONS` as literal arrays in `features/products/components/products-filters.tsx`. The design's S2 filter drawer makes this more visible, not less: it presents Size and Colour as tag toggles and captions the results with "4 of 12 pieces", so an option that yields nothing in the current category reads as a broken filter rather than an honest empty set.

**What we need (either):**

- **Preferred:** facet counts on the existing listing response — e.g. `meta.facets: { sizes: [{ value, count }], colors: [{ value, count }] }` scoped to the active query minus that facet. This also lets us disable zero-count options, which is the same treatment the design already mandates for zero-count sub-categories on S8 ("a zero is a real answer, not a missing page").
- **Alternative:** a static `GET /products/filters?category=` returning the available values.

**Our fallback:** keep the hardcoded arrays and let empty results speak for themselves. Acceptable for v1, but it drifts silently the moment merchandising adds a colour.

---

## GAP-13 · No category description for the listing title band

**Blocks:** Phase 9 (catalogue surfaces, S2). **Severity: low** — cosmetic, but the designed band is visibly thinner without it.

**Contract today:** `GET /categories` returns `id`, `name`, `slug`, `imageUrl`, `productCount` and `subCategories`. There is no description, tagline, or editorial field on either a category or a sub-category.

**Consequence:** S2's title band pairs the category name with a justified 56ch introduction ("Twelve pieces, cut and finished in the Cairo atelier. Evening, day and bridal — filter by the size and colour you actually wear."). Nothing in the contract can produce that sentence. Hardcoding a slug-to-copy map in the frontend would go stale without a deploy and would silently render nothing for any category merchandising adds later, and the design's own copy makes a **count claim** ("Twelve pieces") that would contradict `productCount` the moment stock moved.

**What we need:** an optional `description` (or `intro`) string on the category resource, returned by `GET /categories` and `GET /categories/:slug`. Plain text, no count claims — the storefront already has `productCount` for that.

**Our fallback:** render the heading alone over the hairline and omit the paragraph. Task 9.3 shipped this way; no copy was invented.

---

## GAP-14 · A product page cannot resolve a shipping fee it can honestly attribute

**Blocks:** Phase 9 (catalogue surfaces, S3). **Severity: low** — one designed row degrades; nothing is blocked.

**Contract today:** `GET /shipping/fee` **requires** `country` and `governorate` and resolves them to a single zone. It has no default, no "cheapest zone", and no nationwide rate.

**Consequence:** S3's buy box closes with a Delivery row reading "Cairo, 2–4 days · 65 EGP". A product page has **no destination** — the visitor may be a guest with no address, and the storefront reads no geo signal — so there is no honest input for the required parameters. The day range is separately unsourced (see **GAP-6**).

**What we need (either):** a destination-free summary rate — e.g. `GET /shipping/fee` with no parameters returning the lowest active zone fee, or a `from` field on the shipping resource — so the storefront can state a starting price without inventing a city. Pairing it with **GAP-6**'s duration field would let the row render as designed.

**Our fallback:** call the endpoint with a hardcoded `Egypt / Cairo` display default and render the fee alone, omitting the day promise. Task 9.4 shipped this way. The value is real, but the destination it is quoted for is a frontend assumption, and it will silently misquote a shopper outside Cairo. Note the footer already ships a comparable hardcoded "Delivery from 65 EGP" claim, so this is not a new class of problem — but it is a second instance of it.

---

## Resolution log

| Gap | Status | Resolved by / notes |
|---|---|---|
| GAP-1 | open | — |
| GAP-2 | open | — |
| GAP-3 | open | — |
| GAP-4 | open | **Escalated 2026-08-24** — severity raised to high; the approved S13 design depends on it |
| GAP-5 | open | Raised 2026-08-24 from the design review (S9, S13) |
| GAP-6 | open | Raised 2026-08-24 from the design review (S5, S3, S6, S7, S13) |
| GAP-7 | open | Raised 2026-08-24 from the design review (S13) |
| GAP-8 | open | Raised 2026-08-24 from the design review (S12, S13) |
| GAP-9 | open | Raised 2026-08-24 from the design review (S2) |
| GAP-13 | open | Raised 2026-08-25 from task 9.3 (S2 title band) |
| GAP-14 | open | Raised 2026-08-25 from task 9.4 (S3 delivery row) |

---

## Not gaps (checked and confirmed present)

Recorded so the same questions are not re-asked:

- **Product-card colour subtitle** — S1/S2's `Evening · Black, Emerald` subtitle needs colours on the *list* response. `GET /products` already returns `sizes` and `colors` per item. ✅
- **Guest cart expiry copy** — S4's "Guest bags are kept for seven days" is backed by the anonymous cart `expiresAt`. ✅
- **Sub-category counts** — S8's per-row counts come from the existing unpaginated `GET /categories` tree. ✅
- **Order status stages** — S10/S13's four-stage track maps onto the documented status enum. ✅
