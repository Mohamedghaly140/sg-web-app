# Phase 12 — Account Area (S10 Overview, S11 Addresses, S12 Orders, S13 Order detail)

**Objective:** compose the four signed-in screens to their designed layouts, and build the account overview dashboard and profile screen that do not exist yet.

**Prerequisites:** Phase 11 DoD — satisfied: `/contact` shipped in Phase 11. **Phase 6 (orders) must read `done`.**

**API surface:** `GET /users/me`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `POST /orders/claim`, `GET /addresses`, `POST /addresses`, `GET /addresses/:id`, `PATCH /addresses/:id`, `DELETE /addresses/:id`, `PATCH /addresses/:id/default`, `GET /shipping/fee`, `GET /wishlist`.

**Two of these screens are new work, not a re-skin.** `app/account/page.tsx` is currently an inline `EmptyState` placeholder, and `/account/profile` does not exist at all despite the Phase 8 sub-nav linking to it.

## Contract limits this phase must respect

Four parts of the designed account area cannot be built as drawn. All are filed in `docs/backend-contract-gaps.md`, and **none resolve in the design's favour**:

- **GAP-4 (escalated)** — `GET /orders/:id` returns no shipping address and no notes, so screen S13's `DELIVERING TO` and `NOTE FOR THE COURIER` band has no data. Omit the band.
- **GAP-7** — no receipt document and no re-send endpoint exists, so screen S13's Receipt card has nothing behind it. Drop the card; do not ship inert buttons.
- **GAP-8** — order lines carry `productId` but product detail is addressed by `slug`, so `View piece` cannot link. `Buy again` survives because `POST /cart/items` takes `productId`.
- **GAP-15** — order summaries carry no line previews, so S12 cannot show plates or names on every card. Hydrate only the newest in-progress order and keep the rest summary-only.

## Tasks

**Status (audited 2026-09-02 against the working tree):** 12.1 through 12.5 are done in code and match this spec with the documented contract reductions; the 12.3, 12.4 and 12.5 browser checklists remain pending. 12.6 still renders through the **pre-Classical** wishlist and generic Clerk `shadcn` theme. Per-task status is marked inline below.

### 12.1 S10 Account overview — new — **done**

- [x] Create `features/account/` following the house shape, with `index.tsx` exporting a default `AccountFeature` Server Component. **No `features/account` directory and no `/users/me` query exist today** — `app/account/page.tsx` currently renders an inline `EmptyState` reading "Nothing here yet". This task group is comparable in size to the other three account screens combined; scope it accordingly.
- [x] Add `features/account/queries/get-current-user.ts` as a thin server-only `apiFetch` call to `GET /users/me` with `auth: "required"`, per `11-profile.md`. No business logic.
- [x] Compose the greeting row: an `h3` with the customer's name and a muted "Member since …" right-aligned, over a hairline.
- [x] Build the **in-progress order card** with an accent border, using the `data-[selected=true]` hook from Phase 8. It carries an `IN PROGRESS` kicker with a status tag, a row of 52px line-thumbnail plates, the `humanOrderId` in Cormorant 19px tabular figures, a muted 12.5px summary line, the four-stage status track, and an actions column holding `View order` and `Cancel`. Source it from `GET /orders?limit=3`.
- [x] Add the two info cards below: Default address with a "Manage" link, and Profile with an "Edit" link and the design's own meta line, "Email is managed by your sign-in".
- [x] Add the "Earlier orders" block: an `h4` with an "All orders" link over a hairline, then a compact table of order id (tabular), date and line count in muted, status tag, total right-aligned, and a "Details" link.
- [x] Add the **guest-claim card**: copy, a tracking-code input, and a `Claim` primary calling `POST /orders/claim`. Reuse `features/orders/schema/claim-token-schema.ts` for the exact 64-character validation and the existing claim action; the endpoint is rate-limited at 5/60s, so lock the submit and never auto-retry.

### 12.2 Profile — new, small — **done**

- [x] Create `app/account/profile/page.tsx` and a minimal read-only profile rendering `GET /users/me` plus a Clerk "manage account" link. **Read-only is the designed behaviour, not a shortcut** — screen S10's own copy states that email is managed by the sign-in provider.
- [x] This exists primarily so the Phase 8 sub-nav does not link to a route that does not exist. It is small; do not expand it into an editable profile without a design.

### 12.3 S11 Addresses — **done** (code landed 2026-09-01; browser checklist not yet run)

- [x] Compose the split `1fr / 400px` layout: an `h3` with an `+ Add address` primary and a 12.5px count line on the left over a hairline, then one card per address carrying the alias in Cormorant 19px with either a "Default" accent tag or an added-date, the full address as two body lines, and an action row of `Edit`, `Make default` (a disabled "Already default" on the default itself) and `Delete` pushed right. *Landed. The split applies only while the panel is open; closed, the list takes the full width. `Delete` is kept on the default card too — the S11 markup omits it there, but the handoff prose and this phase's DoD both require deleting the default to work, with the server promoting the next address. Count line uses digits, not the design's spelled-out "Three", and is suppressed at zero because the empty state already carries that copy.*
- [x] Compose the right-hand add/edit panel as a card: title with a close icon, a Label field, a two-column grid of Country, Governorate, City, Area, Phone and optional Postal code, a full-width Street address, a 60px courier-details textarea, a live 12.5px fee row from `GET /shipping/fee`, a hairline, then `Save address` at `flex: 1` beside a `Cancel` secondary, closing with the 11px note explaining that the default is changed from the list. *Landed as `address-panel.tsx`. The fee row reuses `ShippingEstimate`'s render-prop rather than a second lookup, and **omits the design's "· 2–4 days"** — GAP-6, no source field, the same reduction `delivery-row.tsx` already applies. Saving is never gated on a resolved fee: an unservable destination is a checkout concern, and the address is still worth storing.*
- [x] **Keep the default-address rule intact:** `PATCH /addresses/:id/default` is the only way the UI changes the default, and there is **no `isDefault` checkbox in the form** — sending `isDefault: false` could leave the customer with no default at all. The design agrees with the existing implementation here; do not "simplify" it back into the form. *Fixed: the create-variant `isDefault` checkbox was removed from `address-form.tsx`, along with the now-dead `isDefault` handling in `create-address-schema.ts` and `create-address.ts`. Default is set exclusively via the list's "Make default" action.*
- [x] Keep the first-address-is-forced-default behaviour and the delete confirmation stating that deleting the default promotes the most recent remaining address. Promotion is server-side; never implement it in the browser. *(functionally intact today, independent of re-skin)*

**Decisions and gaps recorded by this task**

- **The panel's open state lives in the URL**, not in component state — a nuqs `address` param holding `"new"` or an address id (`features/addresses/hooks/addresses-search-params.ts` + `use-addresses-params.ts`, the mandatory two-file split). `Edit` and `+ Add address` are therefore `<Link scroll={false}>`, which let `address-list-item.tsx` **drop `"use client"` and become a Server Component**; only `DeleteAddressButton` and `SetDefaultAddressButton` remain client leaves. The panel is keyed on the param so switching between two addresses remounts the fields — `AddressFormFields` seeds governorate/city into `useState`, and without the key the previous address's destination would leak into the next form. Unknown or foreign ids resolve to the closed state, never `notFound()`. This extends nuqs beyond the "filters, sorting, pagination" wording; `docs/01-conventions.md` §6 and the `docs/00-architecture.md` state-ownership matrix were amended in the same change.
- **`features/shipping/` was extracted first.** The panel's fee row would have created an `addresses → checkout` import edge on top of the existing `checkout → addresses` one. The shipping-fee action, query, schema, type and `ShippingEstimate` moved to their own feature — they were already shared by checkout, checkout-guest and the PDP delivery row, and have their own contract file. Pure move; while moving, `shipping-fee-schema.ts` dropped its import of addresses' `citySchema`/`governorateSchema` for a local `z.string().trim().min(1)`, since `07-shipping.md` specifies only "trimmed, non-empty" with no length cap. `features/shipping` now depends on no other feature.
- **`layout="stack"` was kept, not replaced.** Checkout's "Add a new address" Sheet (`registered-address-step.tsx`) renders the same `AddressForm`, so the panel opts into the 2-column grid through new optional props (`layout`, `columns`, `onDestinationChange`, `footer`, `actions`) rather than changing the shared default. The stack layout keeps its `latitude`/`longitude` inputs; the panel omits them, and PATCH preserves omitted fields.
- **Not verified — the browser checklist has not been run.** `bun lint`, `bunx tsc --noEmit` and `bun run build` all pass, but nothing in this task has been exercised against a live backend: the fee row's `SHIPPING_NOT_AVAILABLE` path, the remount-on-address-switch, default promotion after deleting the default, and the checkout/guest-checkout regressions from the `features/shipping` move are all still unchecked.

### 12.4 S12 Orders — **done** (code landed 2026-09-02; browser checklist not yet run)

- [x] Compose the header row — an `h3` with a muted "N orders · newest first" in tabular figures — then the status filter as a tag row (All as an outline tag, the rest as neutral tags), over a hairline. *Landed inside the suspended result so `GET /orders` remains a single identity-scoped read. The same server-rendered filter element is passed to the result and skeleton; its tags are links, not a client `ToggleGroup`, and `use-orders-params.ts` was deleted once it had no consumer.*
- [x] Compose each order as a card at `gap-3` with three rows: a header row of `humanOrderId` in Cormorant 20px tabular, a status tag, and a right-aligned date and line count; a body row of up to three 46px line-thumbnail plates, a 12.5px two-line summary, and a right-aligned total in Cormorant 18px with a muted "incl. N shipping" beneath; and a status-dependent action row. *Landed as `order-card.tsx`. `GET /orders` has no line data (GAP-15), so only the newest `PENDING`, `PROCESSING`, or `SHIPPED` order is hydrated with one detail read; every other card is deliberately summary-only.*
- [x] Vary the action row as designed: a pending unpaid order gets `View order` primary, `Cancel order` secondary, and a help ghost right; a delivered order gets `View order` secondary plus `Buy again` and `Write a review`; a cancelled order renders the whole card at 75% opacity with its summary line stating that stock was returned and the coupon released. *Landed with the contract reductions: `Write a review` is omitted because order lines carry no slug (GAP-8), and cancelled copy is hedged because stock/coupon release is documented only for customer self-cancel.*
- [x] **Render `Cancel` only when `status === "PENDING" && !isPaid`**, and still handle `409 INVALID_STATUS_TRANSITION` by refetching and showing the new state — "This order has already moved on". The guard is a UX affordance; the server remains authoritative. *Landed; the shared confirmation and revalidation path remains intact.*
- [x] Wire `Buy again` to `POST /cart/items` using the line's `productId`, quantity, colour and size. **Omit `View piece` / product links from order lines** — GAP-8 means there is no slug to link to. *Landed as a strict, authenticated Server Action that adds sequentially, skips only documented unavailable-line errors, returns the last authoritative cart after partial success, and never detail-fetches through page-control-flow helpers.*
- [x] Keep the copy discipline: `itemsCount` is **distinct lines**, so the UI says "lines", never "items". *Kept across the card header and buy-again result accounting.*
- [x] Restyle `orders-results-boundary.tsx`'s stale-results banner, `orders-list-skeleton.tsx` to the plate geometry, and both empty states (no orders, and no matches for a filter). *Landed with square boundary edges, card-shaped skeletons, persistent filter controls, and Classical `h3` empty-state titles.*

*The summary contract has no destination or status timestamps, so S12 invents neither: cards show payment method plus paid/unpaid state and only the order creation date. The filter keeps all six real statuses, including `REFUNDED`, even though the handoff omits it.*

### 12.5 S13 Order detail — **done** (code landed 2026-09-02; browser checklist not yet run)

- [x] Compose the breadcrumb, then a `1fr / 340px` two-column layout. The left column opens with an `h3` order id in tabular figures, a status tag, and a right-aligned placed-at timestamp, over a hairline. *Landed with a generic shared breadcrumb used by both S13 and the product detail page. The account route owns its Account / Orders / order-id trail; the shared detail view owns only the two-column record and rail.*
- [x] Build the **four-column status timeline**: each column is a 1px top rule — accent for reached stages, divider otherwise — over a 12.5px stage label and an 11.5px timestamp or estimate. Render `—` for stages with no timestamp, and **omit the "2–4 working days" estimate** (GAP-6, no source field). *Landed with `createdAt` on Placed and `—` on the three undated stages. GAP-16 records the missing transition timestamps; no estimate or interpolated date is invented.*
- [x] Reshape `features/orders/components/order-status-stepper.tsx`. It already models the four stages ✅ but renders icon circles with connectors; Classical needs two forms — screen S10's 11px uppercase labels over 1px connectors, and screen S13's four-column rule-and-label timeline. Extend its existing `row` / `detail` variants rather than forking the component. *Landed as one stepper with file-local shared column geometry. The `row` and S10 `track` output stays unchanged; only `detail` now uses the Classical rule, label and timestamp composition.*
- [x] Compose the lines block: a "N lines" `h4` with the 11.5px caveat "Prices as they were when you ordered", then one hairline-separated row per line with an 88px 3:4 `.plate`, the name in Cormorant 19px with `lineTotal` right, and a muted variant-and-quantity line. Add `Buy again`; **omit `View piece`** (GAP-8). *Landed with digit line counts, snapshot-price copy and mat-aware 88px plates. Each line uses the existing optional-auth cart mutation, so `Buy again` works for account and guest tracking without exposing cart identity; `View piece` remains omitted.*
- [x] **Omit the `DELIVERING TO` / `NOTE FOR THE COURIER` band entirely** (GAP-4). Keep the surrounding copy free of any implication that the address is viewable — the same discipline Phase 6 already applied. *Kept omitted. The re-skinned composition adds no placeholder, disabled affordance or copy implying that a destination can be viewed.*
- [x] Compose the right rail's Payment card: money rows, a hairline, the Total at 17px/21px, then "Cash on delivery" with an outline "Unpaid" tag and the 11px line about paying the courier. *Landed as a dedicated Payment card using the server's snapshot amounts, configured payment-method label and an outline paid/unpaid tag. Discount has no coupon suffix because the order contract carries no coupon code.*
- [x] Compose the "Need to change something?" card with a block `Cancel this order` primary, a block `Message the atelier` secondary linking to `/contact` (available because Phase 11 shipped), and the 11px warning that cancelling returns the pieces and frees the coupon and cannot be undone. *Landed on both routes. Self-cancel and its warning are gated to an unpaid pending owner order; guest tracking gets only the public contact link and no account-only action copy.*
- [x] **Drop the Receipt card** (GAP-7). No endpoint backs "Download PDF" or "Email again", and an inert button is worse than an absent card. *Kept omitted with no placeholder or dead receipt controls.*
- [x] Keep `Cancel` behind `ConfirmDialog`, restating that stock returns and the coupon is released. *Kept through the existing shared confirmation path. Its trigger now accepts optional label and layout props while every older call site retains the previous defaults.*
- [x] Remember that `order-detail-view.tsx` is **shared** with `/orders/track/[token]`. Verify the guest tracking route after every change here; it has no account chrome and must not gain any. *Kept guest-safe: tracking passes neither breadcrumb nor `allowCancel`, and its existing claim card now composes into the shared rail rather than sitting below the grid. The browser verification remains pending.*

### 12.6 Undesigned surfaces in this phase — **not started**

- [ ] `/account/wishlist` has no design. Derive it from the screen S2 grid using the existing `WishlistList`, `WishlistItem` and `WishlistHeart`, and honour the documented rule that entries with `available: false` render **disabled and unlinked**. Keep the optimistic toggle with rollback. *Current: `wishlist-list.tsx` renders a `divide-y` vertical list, not a grid.*
- [ ] `/orders/track/[token]` has no design. It inherits `order-detail-view.tsx`, so it follows S13 automatically — verify rather than redesign, and keep `tracking-rate-limited.tsx` and the refresh button intact. *Correctly wired to inherit; will pick up S13's look once 12.5 lands. No redesign needed here specifically.*
- [ ] The `(auth)` sign-in and sign-up screens have no design and **contain no custom components** — they are Clerk's `<SignIn />` and `<SignUp />`. Re-skinning them means extending the Clerk `appearance` object in `app/providers.tsx`, not editing JSX. Match radius, the heading font and the accent, and verify against the Classical ground. *Current: `app/providers.tsx:50` sets `appearance={{ theme: shadcn }}` only — the stock shadcn Clerk theme, not extended for Classical.*

## Definition of Done

- All four account screens match `designs/Storefront Screens.dc.html` at 1280px, with the five documented gap reductions applied and each one visible as an omission rather than a placeholder.
- The account sub-nav highlights the correct item on all five account routes, and **no sub-nav item links to a route that does not exist.**
- The overview dashboard renders real data for a customer with at least one in-progress order, one saved address and three past orders.
- **A PENDING unpaid order is cancelled successfully**, and forcing a `409 INVALID_STATUS_TRANSITION` refetches and re-renders the new state rather than showing a stale one.
- `Buy again` adds the right variant to the cart from both the list and the detail screen.
- Making an address default, editing one, and deleting the default all behave as before, with the server-promoted default reflected after revalidation.
- `Message the atelier` reaches `/contact`.
- The guest tracking route still renders correctly after the shared `order-detail-view.tsx` changes.
- The Clerk sign-in and sign-up screens sit on the Classical ground.
- A second signed-in browser proves order and address data does not leak across sessions.
- `bun run build` succeeds.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

An editable profile form. The order-detail address band, the receipt card, and product links from order lines, all blocked on GAP-4, GAP-7 and GAP-8 respectively. Responsive collapse of the account sub-nav is Phase 13.
