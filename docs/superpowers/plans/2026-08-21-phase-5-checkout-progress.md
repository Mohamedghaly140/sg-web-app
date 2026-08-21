# Phase 5 Checkout — Delegation Progress

Plan: `docs/superpowers/plans/2026-08-21-phase-5-checkout.md`. Executed via `cursor-delegate`, one task per brief, sequential.

**Commit policy (per user instruction, given after Task 1 landed):** Task 1 is already committed
(`39cea3e`). From Task 2 onward, changes are implemented and gate-verified but left **uncommitted**
in the working tree — the user will run `codex:review` over the full accumulated diff before anything
past Task 1 is committed. Do not commit Tasks 2–12 until told to.

## Status table

| Task | Description | Status | Commit |
|---|---|---|---|
| 1 | Checkout types + payment-method config seam | done | 39cea3e |
| 2 | Checkout schemas | implemented, uncommitted | |
| 3 | Shared CheckoutErrorResolver | implemented, uncommitted | |
| 4 | Shipping estimate action + component | implemented, uncommitted | |
| 5 | Coupon preview action + hook + component | implemented, uncommitted | |
| 6 | Payment method selector | implemented, uncommitted | |
| 7 | placeGuestOrderAction + step-param hooks | implemented, uncommitted | |
| 8 | AddressFormFields extension + guest contact/shipping steps | implemented, uncommitted | |
| 9 | Guest review step + wizard + confirmation + route | implemented, uncommitted | |
| 10 | Registered checkout action + content + route | implemented, uncommitted | |
| 11 | Wire "Proceed to checkout" in cart summary | implemented, uncommitted | |
| 12 | Full DoD verification + docs update | partially done (build coherence check only) | |

## Per-task notes

### Task 1 (39cea3e)
Matches plan verbatim (verified by reading all 4 files). `bunx tsc --noEmit` clean. `bun lint`
fails only on the pre-existing repo-wide ESLint 10 / eslint-plugin-react crash on a vendored
template file (`.agents/skills/.../layout.tsx`), documented in `docs/phase-2-guest-cart.md` —
not caused by these files, confirmed by re-running lint myself.

### Task 2 (uncommitted)
Matches plan verbatim (verified by reading all diffs/files). `bunx tsc --noEmit` clean. Not
committed per updated commit policy — will land as part of the post-review batch.

### Task 3 (uncommitted)
Matches plan verbatim. `bunx tsc --noEmit` clean. Not committed.

### Task 4 (uncommitted)
Matches plan verbatim. `bunx tsc --noEmit` clean. Not committed.

### Task 5 (uncommitted)
Matches plan verbatim. `bunx tsc --noEmit` clean. Not committed.

### Task 6 (uncommitted)
Matches plan verbatim. `bunx tsc --noEmit` clean. Not committed. Phase 2 (shared pieces) complete.

### Task 7 (uncommitted)
Matches plan verbatim. Cursor correctly followed the code block over a stale mention of
`checkoutSearchParamsCache` in the plan's Interfaces prose (that export was removed from the code
during self-review but the prose line wasn't updated) — fixed the plan doc's two stale mentions to
say `checkoutParamsParsers` instead. `bunx tsc --noEmit` clean. Not committed.

### Task 8 (uncommitted)
`address-form-fields.tsx` diff is surgical/additive exactly per plan — verified caller safety
(`address-form.tsx`, Phase 4, doesn't pass the new optional `onDestinationChange` prop, unaffected).
Guest contact/shipping step files match plan. One reasonable deviation: `guest-shipping-step.tsx`
explicitly types the `destination` `useState` generic (`{country: string; governorate: string; city:
string}`) instead of letting it infer from the literal `DEFAULT_COUNTRY` — inference would have
narrowed `country` to the literal `"Egypt"` type, which `setDestination(next: {country: string; ...})`
from `AddressFormFields`'s callback isn't assignable to. Correct fix for a real `tsc` error. `bunx tsc
--noEmit` clean. Not committed.

### Task 9 (uncommitted)
Full guest wizard landed: checkout-cart-summary, order-confirmation, guest-review-step,
guest-checkout-wizard (correctly copied the render-purity-fixed version — `setQueryData` only inside
`handleSuccess` via `Form`'s `onSuccess`, verified), checkout-guest/index.tsx,
app/checkout/guest/page.tsx, plus Step 4b's `onFeeChange` lift into guest-shipping-step.tsx. One real
bug in my plan caught and correctly fixed by Cursor: `EmptyState`'s `icon` prop is required (not
optional, confirmed by reading `components/shared/empty-state/index.tsx`) but the plan's code block
omitted it — fixed inline with `<LucideShoppingBag className="size-6" />` matching the existing cart
empty-state pattern. I patched the plan doc itself (both this occurrence and Task 10's identical one)
so Task 10 doesn't hit the same bug. `bunx tsc --noEmit` clean. Not committed.

## Needs your eyes

- Plan had two small defects surfaced during Cursor's own implementation, not by my review before
  dispatch: a stale `checkoutSearchParamsCache` mention (Task 7, cosmetic, prose-only) and a missing
  required `EmptyState.icon` prop (Task 9, would have failed `tsc`). Both were caught and fixed
  inline by Cursor, and I've patched the plan doc to match. Not blocking, but worth surfacing for
  `codex:review`.

### Task 10 (uncommitted)
Registered checkout landed: `placeOrderAction` (Auth-only, no cart-session cookie touched, correctly
notes `CartMergeBridge`/`syncCartAction` already merged the guest cart before this page renders),
`checkout-sign-in-prompt.tsx`, `registered-checkout-content.tsx` (correctly picked up the
`EmptyState.icon` fix and kept `setQueryData` inside `handleSuccess`, verified by reading the full
file), `features/checkout/index.tsx` (auth-branching Server Component), `app/checkout/page.tsx`. All
match plan verbatim. `bunx tsc --noEmit` clean. Not committed. Phase 4 nearly done — only Task 11
(cart entry point) and Task 12 (DoD) remain.

### Task 11 (uncommitted)
Exact match to plan diff. `bunx tsc --noEmit` clean. Not committed. Only Task 12 (final DoD +
docs update) remains.

### Task 12 (partial — build coherence check only, uncommitted)
All 11 implementation tasks landed and individually verified (`bunx tsc --noEmit` clean after every
task). Ran `bun run build` as a final repo-wide coherence check: production build succeeds,
`/checkout` and `/checkout/guest` both register as dynamic routes alongside the rest of the app.
**Not done:** the plan's Task 12 Steps 1-4 (full manual guest + registered happy-path browser runs,
rapid-double-click/429 exercise, admin-driven stock/coupon-state errors, network inspection for
leaked identity) — these need a live backend, a Clerk test account, and ideally a second
admin-session browser, so I did not attempt them headlessly via Cursor (unreliable for real browser
QA) or claim they passed. **Also not done:** flipping `docs/README.md`'s Phase 5 row to done, and
the `docs/phase-5-checkout.md` DoD note — both depend on the manual checks above actually passing,
and on your `codex:review` pass landing first per your instruction.

## codex:review findings — fix queue

`codex:review` ran against the full working-tree diff and returned 6 P1 + 4 P2 findings. I
independently verified every one against the actual landed code (not just trusting the review) —
none were false positives, including confirming the `unflattenFormData` prototype-pollution path
with a live check (`{}.__proto__` on a plain-object cursor really does resolve to `Object.prototype`)
and confirming Zod v4's `flattenError` behavior on nested schemas with a live `bun -e` test (it puts
errors under the top-level key `"contact"`/`"shipping"`, not dotted paths — the guest form's field
errors are currently unreachable).

Grouped into 4 sequential Cursor fix briefs:

| Fix | Findings covered | Status | Commit |
|---|---|---|---|
| A | P1 prototype pollution (unflattenFormData); P1 flattenError dotted paths | implemented, uncommitted | |
| B | P1 no error surfaced (both flows); P1 structured cart errors discarded; P2 guest step routing wrong; P2 stale address/coupon after 404 | implemented, uncommitted | |
| C | P1 confirmation discards authoritative order totals | implemented, uncommitted | |
| D | P1 nested `<form>` (AddressForm inside checkout Form); P2 shipping-fee race condition; P2 unreachable `"placed"` step | implemented, uncommitted | |

### Fix-queue notes

#### Fix A (uncommitted)
Both bugs fixed correctly. `unflattenFormData` now uses `Object.create(null)` for every intermediate
and skips any path segment in `{"__proto__","constructor","prototype"}`. Independently re-verified
myself (not just trusting Cursor's report) with my own throwaway `bun` script replicating the exact
landed logic against three attack paths (`__proto__.polluted`, `constructor.prototype.polluted2`,
`a.__proto__.polluted3`) — `Object.prototype` stays clean on all three, and legitimate nesting still
works. `checkout-error-resolver.ts` now special-cases `ZodError` before the `resolveCheckoutError`
branch, flattening via `issue.path.join(".")` instead of `z.flattenError` — correct. `bunx tsc
--noEmit` clean, no stray verification files left behind.

#### Fix C (uncommitted)
Both actions now return `itemsSubtotal`/`discountApplied`/`shippingFees`/`totalOrderPrice` in their
success `ActionState.response`. `OrderConfirmation` renders all four via `formatEGP()` in a `<dl>`
matching `CheckoutCartSummary`'s pattern, discount row only shown when non-zero
(`!isSameDecimal(discountApplied, "0")`). Both `guest-checkout-wizard.tsx` and
`registered-checkout-content.tsx` defensively type-check all four fields before promoting them to
local state and passing through to `OrderConfirmation` — no client-side arithmetic anywhere. `bunx
tsc --noEmit` clean.

#### Fix B (uncommitted)
All four bugs fixed correctly, combined into one `onError` handler per file (as required — `Form`
only accepts one). `suppressBuiltInToasts` removed from both `<Form>`s, restoring the default
`toast.error(actionState.message)` on failure. Both `onError` handlers refetch `/api/cart` via
`fetchCurrentCart()` + `queryClient.setQueryData(cartKeys.current, freshCart)` (with `.catch(() =>
{})`) on `INSUFFICIENT_STOCK`/`INVALID_VARIANT`/`CART_EMPTY`, so `CheckoutCartSummary`'s existing
`needsAttention` banner picks up fresh data without any new UI. Guest wizard now only routes to
`"shipping"` when the resolver's step is `"address"` — everything else correctly stays on review.
Registered content's `onError` calls `router.refresh()` + `setApplied(null)` on `RESOURCE_NOT_FOUND`.
`bunx tsc --noEmit` clean.

#### Fix D (uncommitted) — last fix in the queue
`AddressForm` (create mode) now renders inside a `Sheet` (`SheetTrigger render={<Button .../>}`,
matching `features/cart/components/cart-drawer.tsx`'s exact established pattern verbatim — confirmed
by re-reading that file), so its `<form>` portals outside the outer checkout `<form>`'s DOM tree
instead of nesting inside it; `showCreateAddress` still defaults open for zero-address customers,
same behavior as before, just structurally safe now. `shipping-estimate.tsx` adds a `requestIdRef`
counter, synchronously resets `fee`/`error`/calls `onResolved(null)` at the start of every new lookup
(so dependent Next/submit buttons disable immediately on destination change), and ignores any
response whose request id no longer matches the latest — confirmed correct against the exact race
condition described. `checkout-search-params.ts`'s `GUEST_CHECKOUT_STEPS` no longer includes
`"placed"`; grepped myself and confirmed no other reference to `GUEST_CHECKOUT_STEPS`/
`GuestCheckoutStep` exists anywhere in `features/checkout` or `features/checkout-guest`. `bunx tsc
--noEmit` clean.

## codex:review fix queue — closing summary

All 4 fixes landed and independently re-verified (diffs read, logic re-checked against the original
finding, `bunx tsc --noEmit` re-run myself after every fix — never trusted Cursor's self-report
alone). Final coherence check: `bun run build` (full production build, not just `tsc`) passes clean
with all routes, including `/checkout` and `/checkout/guest`, registering correctly.

All 9 `codex:review` findings, resolved:

1. **[P1] Prototype pollution in `unflattenFormData`** — Fix A. `Object.create(null)` intermediates +
   explicit `__proto__`/`constructor`/`prototype` segment rejection. Independently re-verified with my
   own live attack-path test (3 payloads), all safe.
2. **[P1] Nested `<form>` (`AddressForm` inside checkout `Form`)** — Fix D. Wrapped in a portal-backed
   `Sheet`, matching the repo's existing `cart-drawer.tsx` pattern exactly.
3. **[P1] `flattenError` doesn't produce dotted field-error keys for nested schemas** — Fix A. Live
   Zod v4 test confirmed the bug; `fromCheckoutErrorToActionState` now special-cases `ZodError` with
   an `issue.path.join(".")`-based flatten.
4. **[P1] No error surfaced on checkout failure (both flows)** — Fix B. Removed
   `suppressBuiltInToasts` from both `<Form>`s, restoring the default failure toast.
5. **[P1] Structured cart errors (`INSUFFICIENT_STOCK`/`INVALID_VARIANT`) discarded, no cart
   refresh** — Fix B. Both flows' `onError` now refetch `/api/cart` and update the TanStack cache on
   those codes (plus `CART_EMPTY`), so the existing `CheckoutCartSummary` attention banner picks up
   fresh data — no new UI needed, the existing Phase 2 drift-detection design was sound, it just
   never fired.
6. **[P1] Confirmation discards authoritative order totals** — Fix C. Both actions return
   `itemsSubtotal`/`discountApplied`/`shippingFees`/`totalOrderPrice`; `OrderConfirmation` renders
   them via `formatEGP()`.
7. **[P2] Guest step routing sends every non-review failure to "contact"** — Fix B. Now only routes
   to `"shipping"` when the resolver's step is `"address"`; everything else stays on review.
8. **[P2] Shipping-fee race condition** — Fix D. Request-id ref guards against stale out-of-order
   responses; fee/error cleared synchronously at the start of each lookup.
9. **[P2] Stale address/coupon not reconciled after `RESOURCE_NOT_FOUND`** — Fix B. Registered
   checkout's `onError` now calls `router.refresh()` and clears the applied coupon on that code.

Not committed — holding per your standing instruction. Ready for another `codex:review` pass or for
you to commit.

## codex:review round 2 — fix queue

A second `codex:review` pass (after round 1 landed) returned 2 P1 + 1 P2 new findings. Independently
verified all three against the current code before dispatching fixes:

1. **[P1] Guest Zod field errors have no target step or message** — confirmed at
   `checkout-error-resolver.ts:115-117`. `fromCheckoutErrorToActionState`'s `ZodError` branch sets
   `fieldErrors` correctly (round 1's fix) but never sets a non-empty `message` (so `Form`'s toast,
   which checks truthiness, silently doesn't fire) and never signals which wizard step the failing
   field lives on — a guest who leaves e.g. `contact.name` blank stays on the Review step with the
   error rendered into a `hidden` section they can't see, and gets zero other feedback.
2. **[P1] `INVALID_VARIANT`/`INSUFFICIENT_STOCK` structured line errors still don't reach the
   customer** — confirmed at `checkout-error-resolver.ts:123-126`, and confirmed the underlying gap
   is real, not just theoretical: `features/cart/types/cart.ts`'s `CartProduct` carries no color/size
   list, so `CheckoutCartSummary`'s existing `needsAttention` heuristic (status/quantity only) cannot
   detect a vanished color/size combo at all — round 1's cart-refetch fix (Fix B) helps
   `INSUFFICIENT_STOCK`/product-unavailable cases via `/cart`'s existing drift UI, but does nothing
   for `INVALID_VARIANT` specifically, since there is no existing UI anywhere that surfaces it. The
   structured `errors[]` array the backend returns is the only source of this information and is
   currently discarded entirely.
3. **[P2] Cart-loading pending/error state misrepresented as an empty cart** — confirmed at
   `guest-checkout-wizard.tsx:78` (and the identical pattern in `registered-checkout-content.tsx`):
   `if (!cart || cart.items.length === 0)` treats "still loading" and "failed to load" the same as
   "genuinely empty," showing "Your cart is empty" with no retry — `features/cart/components/cart-
   content.tsx` (the real `/cart` page) already has the correct `isPending`/`isError` branches to
   copy.

| Fix | Findings covered | Status | Commit |
|---|---|---|---|
| E | P1 no message/step-routing for guest Zod field errors; P2 cart pending/error misrepresented as empty | implemented, uncommitted | |
| F | P1 structured INVALID_VARIANT/INSUFFICIENT_STOCK line errors discarded | implemented, uncommitted | |

### Round 2 fix-queue notes

#### Fix E (uncommitted)
`checkout-error-resolver.ts`'s `ZodError` branch now sets `message: "Please check the highlighted
fields."`, restoring `Form`'s default toast. Guest wizard's single `onError` handler now combines
THREE conditions correctly (cart-refetch on stock/variant/empty codes, step="shipping" routing on
`response.step === "address"`, and new field-error-key-based routing to `"contact"`/`"shipping"`) —
verified all three coexist without conflict since they read disjoint data. Both flows now have the
exact `cart-content.tsx` pending-spinner/error-retry pattern, correctly placed after the
`placedOrder` confirmation check and before the empty-cart check. `bunx tsc --noEmit` clean.

#### Fix F (uncommitted) — last fix in round 2
`resolveCheckoutError` now populates `variantErrors`/`stockErrors` on the `INVALID_VARIANT`/
`INSUFFICIENT_STOCK` cases via the existing `getVariantErrors`/`getStockErrors` parsers;
`fromCheckoutErrorToActionState` JSON-serializes them into `ActionState.response`; the new
`parseCheckoutStructuredErrors` export symmetrically parses them back. `CheckoutCartSummary` renders
per-line annotations matched by `productId`, and its `needsAttention` banner now also fires on these
(previously invisible) cases. Both `guest-checkout-wizard.tsx` and `registered-checkout-content.tsx`
correctly compute `parseCheckoutStructuredErrors(actionState.response)` as a pure derived value in
the component body (every render, in sync with `actionState`) — NOT inside `onError` — and thread it
through to `CheckoutCartSummary`. `bunx tsc --noEmit` clean.

## codex:review round 2 — closing summary

All 2 fixes (E, F) landed and independently re-verified (diffs read in full, logic re-checked against
each finding, `bunx tsc --noEmit` re-run myself after every fix). Final coherence check: `bun run
build` passes clean, both checkout routes still register correctly.

All 3 round-2 findings, resolved:

1. **[P1] Guest Zod field errors had no message and no step routing** — Fix E. `fromCheckoutErrorToActionState`'s
   `ZodError` branch now sets a real message so `Form`'s default toast fires; the guest wizard's
   `onError` now also routes to `"contact"`/`"shipping"` based on which `fieldErrors` keys are
   present, combined with round 1's existing cart-refetch and step="address" logic in the same
   handler.
2. **[P1] Structured `INVALID_VARIANT`/`INSUFFICIENT_STOCK` line errors still weren't visible** —
   Fix F. Threaded through `checkout-error-resolver.ts` → `ActionState.response` (JSON) →
   `parseCheckoutStructuredErrors` → `CheckoutCartSummary`, rendered per-line by `productId` — this
   is the only way `INVALID_VARIANT` can ever be surfaced, since the cart's own product type carries
   no color/size list to detect it from.
3. **[P2] Cart pending/error state misrepresented as empty** — Fix E. Both flows now copy `/cart`'s
   exact pending-spinner/error-retry pattern before the empty-cart check.

**Combined with round 1: 13 total `codex:review` findings across two passes, all fixed and
independently verified — not just trusting Cursor's self-reports.** Not committed — holding per your
standing instruction. Ready for another `codex:review` pass or for you to commit.
