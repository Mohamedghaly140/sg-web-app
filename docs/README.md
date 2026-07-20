# SG Couture Web Storefront — Development Plan

> **Audience:** Claude Code, Codex, and human reviewers implementing the SG Couture customer-facing web storefront.
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Bun · Tailwind v4 · shadcn (base-lyra/@base-ui) · Clerk (`@clerk/nextjs`) · TanStack Query v5 (interactive state only) · nuqs · Zod v4 · lucide-react.
> **Backend contract:** the storefront API integration guide (`docs/integration/storefront/00-conventions.md` through `11-profile.md`) is vendored and read-only. The server is the source of truth for prices, stock, discounts, shipping, and totals; this plan references those rules instead of re-deriving them.
> **Status tracker:** this file's phase table is the single source of truth for what has started and what exists.

## How to use this plan

1. Read [`00-architecture.md`](./00-architecture.md) and [`01-conventions.md`](./01-conventions.md) before implementation; every phase assumes them.
2. Execute phases in order. Each phase document is a self-contained work order with prerequisites and a Definition of Done.
3. When a phase document and the backend integration guide conflict, **the integration guide wins**. Flag the drift instead of guessing or editing the vendored contract.
4. Keep the phase table current: change status when a phase starts and again when it finishes.

## Phase map

| Phase | Doc | Status | Delivers | API modules |
|---|---|---|---|---|
| 0 | [phase-0-foundation.md](./phase-0-foundation.md) | **done** | Next scaffold, server-only BFF, env/auth/cart-session foundations, providers, shared shell and primitives | 00 (conventions) |
| 1 | [phase-1-catalog.md](./phase-1-catalog.md) | **not started** | RSC home, category navigation, product listing/filtering, product detail, public reviews | 01, 02, 03 (read) |
| 2 | [phase-2-guest-cart.md](./phase-2-guest-cart.md) | **not started** | Guest cart page plus interactive drawer/badge and complete `sg_cart_session` lifecycle | 05 |
| 3 | [phase-3-auth-cart-merge.md](./phase-3-auth-cart-merge.md) | **not started** | Clerk auth, account gate, optional/auth BFF modes, implicit guest-cart merge, profile | 00 (auth), 11 |
| 4 | [phase-4-account.md](./phase-4-account.md) | **not started** | Authenticated wishlist, own-review CRUD, and saved addresses | 03 (write), 04, 08 |
| 5 | [phase-5-checkout.md](./phase-5-checkout.md) | **not started** | Shipping estimate, coupon preview, registered and guest CASH checkout | 06, 07, 09 |
| 6 | [phase-6-orders.md](./phase-6-orders.md) | **not started** | Account order history/detail, guest tracking/claim, self-cancel | 10 |
| 7 | [phase-7-hardening-release.md](./phase-7-hardening-release.md) | **not started** | Performance, resilience, accessibility, security, SEO, and production readiness | — |

## Non-goals (v1)

- **Card payments.** The backend returns `422 PAYMENT_METHOD_UNAVAILABLE` for `CARD`; v1 sends CASH only and does not build payment-session flows.
- **User notifications.** No storefront notification endpoints exist yet. Order state is refreshed through normal navigation and user actions, not polling.
- **Localization.** English only in v1.
- **Anonymous wishlist.** Wishlist is auth-only per the API; guests receive an inline sign-in prompt.

## Working agreements

- RSC-first: pages render through Server Components and the server-only BFF. The browser never calls the backend.
- TanStack Query owns interactive cart, wishlist, and coupon state only. If a Server Component can render it, TanStack Query must not own it.
- Branch on error `code`, never on `message`.
- Money values are variable-scale decimal strings. Display through `formatEGP()` and do no client-side money math.
- A phase's Definition of Done includes browser verification of the complete flow, including hard refresh, incognito/guest state, and a second browser for session behavior.
- Update this tracker when starting and finishing every phase.
