# Phase 6 — Orders (History, Detail, Guest Tracking, Claim, Cancel)

**Objective:** deliver the post-purchase web experience: server-rendered order history and detail, public guest tracking through the emailed URL, one-shot claiming into an account, and guarded self-cancellation.

**Prerequisites:** Phase 5 DoD (registered and guest orders exist to display).

**API surface:** `GET /orders`, `GET /orders/:id`, `GET /orders/guest/:token`, `POST /orders/claim`, `POST /orders/:id/cancel`.

## Tasks

### 6.1 Order history

- [ ] Build `/account/orders` as a thin page around an `OrdersFeature` Server Component using the Auth-only, no-store `GET /orders` query. Hand-write the summary and pagination types; label `itemsCount` as distinct products/lines rather than summed quantity.
- [ ] Define `features/orders/hooks/use-orders-params.ts` once for both nuqs server and client parsers. Keep `page`, `limit`, and optional `status` in exact API wire format, update with `shallow: false`, and await Next.js 16 `searchParams` before querying.
- [ ] Render newest-first rows with `humanOrderId`, formatted total, date, and a shared semantic status badge covering `PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED`. Provide explicit refresh through RSC navigation/`router.refresh()` and never add a polling loop or client cache for orders.
- [ ] Add server-rendered loading, empty, error, and pagination states that retain the status filter in the URL and never discard a successfully rendered page because a later refresh fails.

### 6.2 Order detail

- [ ] Build `/account/orders/[id]` as an Auth-only `OrderDetailFeature` Server Component over `GET /orders/:id`; await the promised `params` and use the opaque record ID only in the route and API call.
- [ ] Render permanent item price snapshots, status, `isPaid`, payment method, and `itemsSubtotal`, `discountApplied`, `shippingFees`, and `totalOrderPrice` exactly as server strings through `formatEGP()`. Per GAP-4, render no shipping address, contact, or notes because the detail response does not contain them.
- [ ] Treat `RESOURCE_NOT_FOUND` as the same generic not-found state for missing and other-owner records, with no ownership disclosure and a link back to order history.

### 6.3 Guest tracking

- [ ] Build public `/orders/track/[token]` around `GET /orders/guest/:token`. Resolve the token only in the Server Component, force dynamic/no-store rendering, exclude the route from sitemap indexing, and use restrictive referrer handling.
- [ ] Keep the claim token only in the required tracking path and server call. Never log it, attach it to analytics/error breadcrumbs, place it in navigation labels, or pass it to Client Components; redact the tracking path in observability tooling.
- [ ] Render the same address-free order detail shape as 6.2. For `CLAIM_TOKEN_INVALID`, show only “This tracking link is invalid or has expired,” preserving the deliberate unknown/expired/consumed ambiguity.
- [ ] Respect the 10/60s limit with no automatic retry. `RATE_LIMITED` keeps the page intact and offers a manual server refresh after the wait guidance.

### 6.4 Claim flow

- [ ] On the tracking page, signed-out customers see inline `<RequireAuth>` copy to sign in or create an account and return to the same tracking URL; do not hard-redirect the public page.
- [ ] Bind the route token to `claimOrderAction` server-side rather than rendering it in a form field. Validate the documented exact 64-character length, then call `POST /orders/claim` with a fresh Clerk JWT; expected failures return `ActionState` and mutation retries remain disabled.
- [ ] On success, call `revalidatePath("/account/orders")`, set a redirect toast cookie, and replace-navigate to `/account/orders/[id]` from the returned order ID. The consumed tracking URL is expected to become invalid.
- [ ] If the first claim times out and the directly following retry returns `CLAIM_TOKEN_INVALID`, refresh `/account/orders` as the contract recommends but keep the public tracking copy generic unless a successful claim response identified the order. Never disclose whether another account consumed the token.
- [ ] Preserve the form and show wait guidance on the 5/60s `RATE_LIMITED` response; do not automatically replay the one-shot mutation.

### 6.5 Self-cancel

- [ ] Render cancellation on the owned detail only when `status === "PENDING" && !isPaid`. Put the action behind `ConfirmDialog` with copy explaining that stock returns and coupon use is released.
- [ ] Implement `cancelOrderAction` for `POST /orders/:id/cancel` with the shared ActionState form pipeline. On success, revalidate both `/account/orders` and `/account/orders/[id]` and render the returned `CANCELLED` state through the shared badge.
- [ ] On `INVALID_STATUS_TRANSITION`, refresh the RSC detail, explain that the order state changed, and remove the action when it is no longer eligible. Treat `RESOURCE_NOT_FOUND` with the same generic not-found state as detail.

### 6.6 Post-checkout handoff

- [ ] Update Phase 5 handoffs: registered confirmation links to `/account/orders/[id]`; guest confirmation explains that the tracking URL was sent by email and never fabricates or displays the real token.

## Error handling matrix

| Code | Where | UX |
|---|---|---|
| `CLAIM_TOKEN_INVALID` | tracking / claim | One invalid-or-expired public message; after an immediately preceding timeout, refresh owned order history without disclosing token state |
| `INVALID_STATUS_TRANSITION` | cancel | Refresh the RSC detail, show current status, and remove ineligible cancellation UI |
| `RESOURCE_NOT_FOUND` | detail / cancel | Generic not-found state with no ownership disclosure |
| `RATE_LIMITED` | tracking / claim | Preserve state, show wait guidance, and require manual retry |

## Definition of Done

- Registered order history filters and paginates through URL state; hard refresh preserves the selected status/page and no interval-based polling exists.
- Order detail renders permanent line snapshots and totals without client arithmetic or shipping-address UI, matching GAP-4.
- Private-session guest flow passes: emailed tracking URL → public detail → inline sign-in → claim → owned detail/history; a consumed or invalid URL shows the same generic message.
- A forced timeout followed by an invalid claim retry refreshes owned history while preserving the public ambiguity and never automatically submits again.
- Cancellation succeeds for a seeded unpaid `PENDING` order; `PROCESSING` hides the action, and a second-browser status change forces the handled 409 refresh path.
- Network, analytics, and error-report inspection shows the claim token only in its required browser path and backend server call, never in client JavaScript or telemetry.
- `bun lint` and `bunx tsc --noEmit` pass.

## Out of scope

Refund actions beyond displaying `REFUNDED`; customer notifications until backend endpoints are documented.
