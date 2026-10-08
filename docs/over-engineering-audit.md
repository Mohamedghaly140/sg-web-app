# Over-Engineering Audit — Cleanup Plan

> Source: ponytail audit, 2026-10-08, branch `feat/phase-13-1-frame-and-grids`.
> Scope: whole repo, focused on what to delete, merge, or simplify.
> Assumed load: a small-to-mid online shop (many concurrent shoppers, no single extreme path).
> Estimated outcome: **~-550 source lines, ~3 MB of stray files, -1 dependency (`date-fns`)**.

The core architecture (`apiFetch`, the `sg_cart_session` lifecycle, the
interactive/form action split) is sound. The findings below are about
removing layers that don't pay for themselves, plus one real bug.

Finding numbers (#N) match the original audit report.

## Phase status

| Phase | Theme | Risk | Status |
| ----- | ----- | ---- | ------ |
| 1 | Bug fix: account overview resilience | Low | done |
| 2 | Delete dead code and stray files | Very low | done |
| 3 | Small simplifications | Low | done |
| 4 | Merge duplicated components and hooks | Medium | done |
| 5 | Orders refresh machinery → plain error boundary | Medium | done |
| 6 | Typed `ActionState` data for checkout | Higher (touches shared form kit) | done |

Each phase is independently landable. Run the repo gates after every phase:
`bun lint`, `bunx tsc --noEmit`, `bun run build`, then a browser check of the
touched routes.

---

## Phase 1 — Bug fix: account overview resilience

**Goal:** One failing order-detail fetch must not take down `/account`.

### 1.1 Use `getOrderPreview` on the account overview (#1)

- **Where:** `features/account/index.tsx:28-30`
- **Problem:** The overview enriches the in-progress order with `getOrder()`,
  which throws (via `handleAuthError`) on any error. `/account/orders` does the
  same job with `getOrderPreview()`, which degrades to `null`. A transient
  backend error on that single call crashes the whole account dashboard.
- **Change:**
  ```ts
  const inProgressItems = inProgressOrder
    ? ((await getOrderPreview(inProgressOrder.id))?.items.slice(0, 2) ?? [])
    : [];
  ```

### 1.2 One source for the "in progress" rule (#9)

- **Where:** `features/orders/components/orders-results.tsx:26`,
  `features/account/index.tsx:22-27`
- **Problem:** `PENDING | PROCESSING | SHIPPED` is written twice; the two pages
  can drift apart.
- **Change:** Export `IN_PROGRESS_STATUSES` from
  `features/orders/types/order.ts` and use it in both places.

**Verify:** `/account` and `/account/orders` with an in-progress order; simulate
a failing `GET /orders/:id` and confirm the overview still renders.

---

## Phase 2 — Delete dead code and stray files

**Goal:** Remove code and files that nothing references. Zero behavior change.

### 2.1 Unused modules (#4)

Confirmed by grepping `app/ features/ components/ lib/`:

| File | Lines | Note |
| ---- | ----- | ---- |
| `lib/nuqs-parsers.ts` | 56 | Admin-app leftover (comments cite `docs/integration/admin`); sole importer of `date-fns` |
| `components/shared/active-badge.tsx` | 13 | Never imported |
| `components/shared/payment-status-badge.tsx` | 13 | Never imported |

Then: `bun remove date-fns`.

### 2.2 Dead `/access-denied` branch (#7)

- **Where:** `lib/api/handle-auth-error.ts:21-22`
- **Problem:** `FORBIDDEN` redirects to `/access-denied`, a route that does not
  exist. Its callers (users, orders, addresses reads) never return `FORBIDDEN`
  per `docs/integration/storefront/` — only reviews do.
- **Change:** Delete the `case "FORBIDDEN"`; it falls through to `throw error`.

### 2.3 Stray committed files (#8)

```bash
git rm -r --cached .playwright-mcp          # already in .gitignore
git rm contact-page.png contact-chip-pressed.png
git rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

None are referenced anywhere. ~3 MB removed from every clone.

**Verify:** gates pass; `git grep date-fns` returns nothing outside `bun.lock`.

---

## Phase 3 — Small simplifications

**Goal:** Trim options and indirections that no caller uses.

### 3.1 Remove the alias-only file (#10)

- `features/products/components/products-count-boundary.tsx` is just
  `export const ProductsCountBoundary = HideOnError`.
- Import `HideOnError` in `products-count.tsx`; keep the explanatory comment
  there; delete the file.

### 3.2 Drop the unused `useCart(initialData)` parameter (#11)

- `features/cart/hooks/use-cart.ts:51` — every caller uses `useCart()`.
- Remove the parameter and the "explicit argument wins" sentence in
  `cart-initial-data-provider.tsx`.

### 3.3 Narrow `cldUrl` to the shape actually used (#12)

- `lib/format.ts` — all 10 callers pass an options object. Delete the string
  and array branches (`isCldParts`, `sanitizeCldPart`, the union type).
  ~20 lines.

### 3.4 Un-export file-private symbols (#13)

Drop `export` from symbols only used in their own file, e.g.
`toCartErrorView`, `resolveCheckoutError`, `resolveHeaderVariant`,
`DEFAULT_SORT`/`DEFAULT_PAGE`/`DEFAULT_LIMIT`, `fetchCurrentWishlist`,
`normalizeDecimal`. (~15 total; re-run the unused-export grep to list them.)

**Verify:** gates pass; `/products` count, cart drawer, product images render.

---

## Phase 4 — Merge duplicated components and hooks

**Goal:** One implementation per job.

### 4.1 Collapse the five cart wrapper hooks (#6)

- **Files:** `features/cart/hooks/use-add-cart-item.ts`,
  `use-remove-cart-item.ts`, `use-update-cart-item-quantity.ts`,
  `use-clear-cart.ts`, `use-sync-cart.ts`
- **Problem:** Each is only `return useCartMutation(xAction, options)`.
- **Change:** Call sites (7) use `useCartMutation(addCartItemAction, {...})`
  directly; delete the five files. For clear/sync, pass
  `() => clearCartAction()` / `syncCartAction`.
- **Call sites:** `product-purchase-provider.tsx`,
  `order-line-buy-again-button.tsx`, `cart-line-item.tsx` (×2),
  `cart-drawer.tsx`, `cart-summary.tsx`, `cart-merge-bridge.tsx`.

### 4.2 Merge the two account-disabled sign-out components (#5)

- **Files:** `components/shared/account-disabled/account-disabled-bridge.tsx`,
  `account-disabled-cleanup.tsx`, `use-account-disabled-sign-out.ts`
- **Problem:** Both sign out and `router.replace("/account-disabled")`, each
  with its own `handledRef` guard on top of the session-id guard in the hook.
- **Change:** One component:
  ```tsx
  <AccountDisabledSignOut when={boolean} />
  ```
  - Bridge (in `app/providers.tsx`): `when={error instanceof ApiError && error.code === "ACCOUNT_DISABLED"}` using `useCart()`.
  - Page: `when={shouldSignOut}`.
  - Keep a single once-guard (the session-id one in the hook).

**Verify:** add/remove/update/clear cart, buy-again, post-sign-in cart merge;
disabled-account flow from both entry points (cart error and direct page visit).

---

## Phase 5 — Orders refresh machinery → plain error boundary

**Goal:** Replace a four-file "show last good results" system with the shared
boundary.

### 5.1 Use `SectionErrorBoundary` for orders results (#3)

- **Files to delete:** `features/orders/components/orders-refresh-context.tsx`
  (56), `orders-results-reporter.tsx` (22), `orders-results-boundary.tsx` (69)
- **Problem:** Stores rendered JSX in context state so a failed
  `router.refresh()` can re-show it; needs two `useEffect`s with lint
  suppressions. Covers a rare edge case (refresh failing right after a
  successful load).
- **Change:**
  - `features/orders/index.tsx`: wrap the `Suspense` in
    `<SectionErrorBoundary key={...} title="Orders">`; drop the provider and
    reporter.
  - `refresh-orders-button.tsx`: remove the context read; always render.
- **Trade-off accepted:** on a failed refresh the user sees "Orders is
  unavailable right now. Try again" instead of stale results.

**Verify:** `/account/orders` load, filter, paginate, Refresh; force an API
error and confirm the boundary + retry work.

---

## Phase 6 — Typed `ActionState` data for checkout

**Goal:** Stop stringifying the order into `ActionState.response` and
re-validating it field by field on the client.

### 6.1 Add a typed payload to `ActionState` (#2)

- **Where:** `components/shared/form/utils/to-action-state.ts`
- **Change:** `ActionState<TData = undefined>` gains `data?: TData`;
  `toActionState` and `fromErrorToActionState` accept an optional `data`.
  Existing callers are unaffected (default `undefined`).

### 6.2 Return the order as-is from both checkout actions

- **Where:** `features/checkout/actions/place-order.ts`,
  `place-guest-order.ts`
- **Change:** `toActionState("SUCCESS", "Order placed", formData, undefined, order)`
  — no `JSON.stringify(order.items)`, no `"true"`/`"false"` strings.
- Same for checkout errors in `features/checkout/lib/checkout-error-resolver.ts`:
  put `{ step, code, variantErrors, stockErrors }` in `data` instead of
  JSON strings in `response`.

### 6.3 Render the confirmation from action state

- **Where:** `features/checkout/components/registered-checkout-content.tsx:84-121`,
  `features/checkout-guest/components/guest-checkout-wizard.tsx:~76-120`
- **Change:** When `actionState.status === "SUCCESS" && actionState.data`,
  render `<OrderConfirmation>` from it. Keep `handleSuccess` only for the
  `setQueryData(cartKeys.current, EMPTY_CART)` side effect.
- **Delete:** both `typeof` chains, the `placedOrder` `useState`,
  `features/checkout/schema/order-item-schema.ts`,
  `parseCheckoutStructuredErrors`.
- **Guest-only fields** (`email`, `deliveryCity`, `deliveryGovernorate`) still
  come from `actionState.payload`, or return them in `data` from the guest
  action.

**Before starting:** consult `fable-advisor` — this changes the shared form
kit's `ActionState` contract documented in `AGENTS.md` / `docs/01-conventions.md`;
update those docs in the same change.

**Verify:** registered and guest checkout end to end (success, coupon error,
`INSUFFICIENT_STOCK`, `INVALID_VARIANT`, `PAYMENT_METHOD_UNAVAILABLE`);
confirmation renders all totals and items; cart badge empties.

---

## Not covered by this audit

- UI-heavy components not read line by line: product filters/gallery, address
  form fields, contact form, `components/ui/` (shadcn).
- `docs/`, `.agents/`, `.cursor/`, `.codex/`, `app/globals.css`.
- No lint, type-check, build, or browser run was performed for the audit.
