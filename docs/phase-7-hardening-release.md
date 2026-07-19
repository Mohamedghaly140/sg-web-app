# Phase 7 — Hardening & Web Release

**Objective:** make the storefront production-ready through search visibility, measurable web performance, resilient route states, security and privacy verification, accessibility, privacy-safe observability, and a repeatable production release.

**Prerequisites:** Phases 0–6 DoD; final brand tokens and production content available.

## Tasks

### 7.1 SEO and discoverability

- [ ] Define site-wide metadata defaults and per-route titles, descriptions, canonicals, Open Graph data, and social images. Use `generateMetadata` for dynamic public product/category pages and graceful metadata fallbacks when a record is unavailable.
- [ ] Add `app/sitemap.ts` with public canonical catalog routes only and `app/robots.ts` with the production policy. Exclude and mark noindex for `/account/**`, `/checkout`, `/checkout/guest`, and `/orders/track/[token]`.
- [ ] Add validated Product JSON-LD on product detail and BreadcrumbList JSON-LD on public hierarchy pages. Use server-provided price/availability fields without client arithmetic and escape serialized data safely.
- [ ] Verify canonical URLs, metadata, structured data, sitemap, robots behavior, and social previews against the production domain with duplicate query/filter pages handled intentionally.

### 7.2 Performance

- [ ] Establish release budgets: p75 LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, and Lighthouse performance/accessibility/SEO scores ≥ 90 on representative catalog, product, cart, and checkout routes.
- [ ] Audit every product and content image through `next/image`: correct intrinsic sizing, responsive `sizes`, priority only for true LCP media, useful alt text, and width/quality-aware Cloudinary transforms without upscaling.
- [ ] Run the Next.js bundle analyzer, inspect route-specific client bundles and RSC boundaries, remove accidental client imports, and defer non-critical interactive islands.
- [ ] Add meaningful Suspense boundaries and skeletons around slow server segments so catalog/product shells stream without layout shift; keep pages and data reads server-first.
- [ ] Verify public catalog revalidation and semantic tags with backend request counts and cache behavior. Only Public calls carrying neither `Authorization` nor `X-Cart-Session` may use `next: { revalidate, tags }`; every identity-bearing call remains no-store.

### 7.3 Resilience and failed-fetch posture

- [ ] Audit `loading.tsx`, `error.tsx`, and `not-found.tsx` coverage across public catalog, cart, account, checkout, and order route segments. Each boundary offers an appropriate retry or safe navigation target and never leaks backend details.
- [ ] Provide deliberate empty states for catalog results, wishlist, addresses, cart, and orders, plus inline recovery for checkout step failures without discarding form/cart state.
- [ ] Test offline and failed-fetch behavior in browser tooling: preserve already rendered content where safe, show a clear connection state, prevent mutation replay, and recover through manual retry when connectivity returns.
- [ ] Test slow responses and partial failures so skeletons reserve layout space, redirect toasts survive navigation, and unknown API codes fall back to generic actionable copy.

### 7.4 Security and privacy sweep

- [ ] Inspect the production client bundle, rendered HTML/RSC payloads, browser storage, network traffic, application logs, analytics, and error reports for Clerk JWTs and guest session values: none may appear client-side. The claim token may exist only in the required `/orders/track/[token]` browser path and server request; redact that path everywhere else.
- [ ] Verify `sg_cart_session` is set only server-side with `httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, and a seven-day maximum age; no client code can read or return it.
- [ ] Audit exactly three `sg_cart_session` deletion events end-to-end: successful merge after post-sign-in `GET /cart`, successful `POST /orders/guest`, and successful anonymous `DELETE /cart`. Confirm failed operations and coupon validation never delete it.
- [ ] Audit every money display for `formatEGP()` and zero browser arithmetic. Checkout, cart, coupon, shipping, and order totals must remain server strings from their respective responses.
- [ ] Confirm `proxy.ts` protects `/account(.*)` as UX only while every Server Component, Server Action, and Route Handler still relies on backend 401/403 authorization. Review security headers and apply a restrictive referrer policy to token tracking.
- [ ] Run the Bun dependency/security audit, review production-only dependencies, and resolve actionable findings without exposing environment values in build output.

### 7.5 Accessibility

- [ ] Complete a keyboard-only pass over header/navigation, filters, product options, cart drawer, address forms, both checkout flows, tracking, claiming, and cancellation; every action has visible focus and a logical order.
- [ ] Verify focus entry/restoration and Escape behavior in drawers, sheets, and `ConfirmDialog`, using the actual base-lyra `@base-ui/react` component anatomy.
- [ ] Check text/control/status-badge contrast, zoom/reflow, touch target size, semantic headings/landmarks, field error associations, and pending/success announcements.
- [ ] Audit alt text and decorative-image handling, then complete a screen-reader pass of guest and registered checkout including validation, stock errors, and order confirmation.

### 7.6 Observability

- [ ] Decide whether to enable an error-reporting provider. If enabled, configure environment/release tags and strict filtering so contact/address data, Clerk JWTs, guest sessions, claim tokens, and tokenized paths are never sent.
- [ ] Surface unexpected 5xx/network failures with route and stable API error code only; treat production `VALIDATION_ERROR` on a guarded request as a client-contract signal without recording request bodies.
- [ ] Make 429 behavior observable by route and count while preserving customer state and avoiding mutation replay. Verify dashboards distinguish expected rate limits from backend availability failures.

### 7.7 Web release engineering

- [ ] Define development, preview, and production environment ownership for only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and server-only `API_URL`. Validate through `lib/env.ts`; never introduce a browser-visible backend URL.
- [ ] Configure the production Clerk instance, allowed origins/redirects, account emails, and disabled-account behavior against the final HTTPS domain.
- [ ] Select and document the deploy target, production domain/DNS/HTTPS setup, build command, health verification, rollback owner, and secret-rotation procedure.
- [ ] Gate release on `bun lint`, `bunx tsc --noEmit`, and `bun run build`, then smoke-test the built artifact with production-like environment values and no source-map/token leakage.
- [ ] Execute the union of every phase DoD in two independent browsers, including a signed-out private session, hard refreshes, cross-session price/stock/status changes from the admin app, and all three cart-cookie deletion events.
- [ ] Run the SEO, structured-data, accessibility, responsive-layout, Core Web Vitals, 429, and 5xx checks against the release candidate before production promotion and repeat the critical purchase loop after promotion.

### 7.8 Forward seams

- [ ] Document the CARD/Geidea seam: the payment config can reveal CARD with one flag, and `CheckoutErrorResolver` already handles `PAYMENT_METHOD_UNAVAILABLE`; actual charging remains disabled until a future backend contract defines the required flow. Do not invent a payment-session endpoint.
- [ ] Reserve a feature boundary and navigation placeholder for customer notifications, but ship no inbox, subscription, or delivery behavior until documented backend endpoints exist. Order status remains server-rendered and manually refreshed.

## Definition of Done

- Public canonical routes expose correct metadata, social images, sitemap/robots policy, and validated Product/BreadcrumbList structured data; private, checkout, and tokenized routes are not indexed.
- Representative production routes meet the stated Core Web Vitals and Lighthouse budgets, and cache verification proves public catalog reads do not hammer the backend per request.
- Every route segment has deliberate loading/error/not-found/empty behavior, and offline/429/5xx drills preserve customer state without mutation replay.
- Keyboard and screen-reader checkout passes complete with focus, contrast, error, and announcement issues resolved.
- Production inspection finds no Clerk JWT, guest session, PII, or claim token outside the single required tracking path/server request, and the three `sg_cart_session` deletion events pass exactly.
- The release candidate passes `bun lint`, `bunx tsc --noEmit`, `bun run build`, and the full two-browser regression before and after production promotion.
- CARD and customer-notification seams are documented without building against undocumented backend endpoints.

## Out of scope

Real CARD charging, customer-notification delivery, full offline commerce, and introducing an automated application test suite.
