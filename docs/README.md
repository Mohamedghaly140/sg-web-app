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
| 1 | [phase-1-catalog.md](./phase-1-catalog.md) | **done** | RSC home, category navigation, product listing/filtering, product detail, public reviews | 01, 02, 03 (read) |
| 2 | [phase-2-guest-cart.md](./phase-2-guest-cart.md) | **in progress** | Guest cart page plus interactive drawer/badge and complete `sg_cart_session` lifecycle | 05 |
| 3 | [phase-3-auth-cart-merge.md](./phase-3-auth-cart-merge.md) | **done** | Clerk auth, account gate, optional/auth BFF modes, implicit guest-cart merge | 00 (auth) |
| 4 | [phase-4-account.md](./phase-4-account.md) | **done** | Authenticated wishlist, own-review CRUD, and saved addresses | 03 (write), 04, 08 |
| 5 | [phase-5-checkout.md](./phase-5-checkout.md) | **in progress** | Shipping estimate, coupon preview, registered and guest CASH checkout | 06, 07, 09 |
| 6 | [phase-6-orders.md](./phase-6-orders.md) | **in progress** | Account order history/detail, guest tracking/claim, self-cancel | 10 |
| 7 | [phase-7-classical-foundation.md](./phase-7-classical-foundation.md) | **done** | Classical tokens, ramps, type scale, fonts, shadows, radius, `.plate`, tabular figures, money format | — |
| 8 | [phase-8-primitives-and-shell.md](./phase-8-primitives-and-shell.md) | not started | All `components/ui` primitives, shared kit, header/footer/sidenav, account sub-nav, density flip | — |
| 9 | [phase-9-catalogue-surfaces.md](./phase-9-catalogue-surfaces.md) | not started | S1 Home, S2 Listing, S3 Product detail, S8 Categories | 01, 02, 03 (read) |
| 10 | [phase-10-bag-and-checkout.md](./phase-10-bag-and-checkout.md) | not started | S4 Cart, S5 registered, S6 guest, S7 confirmation, shared step rail | 05, 06, 07, 09 |
| 11 | [phase-11-contact-and-order-help.md](./phase-11-contact-and-order-help.md) | not started | S9 Contact — new route and feature; order-help lookup | 10 (guest lookup) |
| 12 | [phase-12-account-area.md](./phase-12-account-area.md) | not started | S10 Overview (new), S11 Addresses, S12 Orders, S13 Order detail, profile, wishlist | 04, 08, 10, 11 |
| 13 | [phase-13-responsive.md](./phase-13-responsive.md) | not started | Derived mobile and tablet behaviour across all fifteen screens | — |
| 14 | [phase-14-dark-classical.md](./phase-14-dark-classical.md) | not started | Derived dark palette plus the theme provider that does not exist yet | — |
| 15 | [phase-15-hardening-release.md](./phase-15-hardening-release.md) | not started | Performance, resilience, accessibility, security, SEO, and production readiness | — |

### The Classical re-skin (Phases 7–14)

Phases 7–14 apply the approved visual design in `docs/design_handoff_sg_storefront/` to the existing storefront. **They change how the storefront looks, not what it does** — the data layer, Server Actions, queries, cart-session lifecycle and TanStack wiring are out of scope throughout.

Hardening was renumbered from 7 to 15 rather than left in place. Its own prerequisite already read *"final brand tokens and production content available"*, and the handoff **is** those tokens: measuring LCP against Inter/Playfair, or running a contrast pass on a palette we are about to replace, measures a skin the storefront is about to discard. Note that the "Phase 7" references in `docs/integration/storefront/` refer to the **backend's** phase numbering (Geidea card payments), which is a separate namespace.

**Hard gate:** Phases 2, 5 and 6 must read **done** before Phase 7 starts. Re-skinning underneath in-flight cart, checkout and orders work collides in exactly the files Phases 10 and 12 rewrite hardest.

**Two open product decisions** are recorded in `phase-8-primitives-and-shell.md` §8.10 and must be answered by a person, not resolved inside a commit: the brand-name conflict (the app ships "Safa Ghaly", every designed screen reads "SG·COUTURE"), and "The Makers", which appears in the designed nav and on the home page with no backend content source and no route.

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
