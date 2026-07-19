# 00 — Architecture

## Context and goals

SG Couture WEB is the customer-facing Next.js storefront and the primary client of the standalone `sg-couture-api` backend. The backend exposes a live, versioned REST contract under `/api/v1`; this application owns the web experience and a server boundary, but no database or business rules. The browser never calls the backend directly.

Goals, in priority order:

1. **Contract fidelity** — every flow honors the documented auth mode, request whitelist, response envelope, guest-cart identity, and error codes.
2. **Maintainability** — App Router pages stay thin; feature modules own presentation and orchestration; the server-only API layer owns transport concerns.
3. **SEO and perceived performance** — catalog pages render as Server Components, public reads use deliberate revalidation, and interactive cart and wishlist UI updates immediately from authoritative mutation responses.
4. **Forward compatibility** — the checkout boundary leaves a clear seam for Geidea `CARD` support, and customer notifications can be added without changing the data-access model.

## Stack decisions (mini-ADRs)

### ADR-W001 — Next.js 16 App Router, RSC-first

**Accepted.** Use Next.js 16.2.10 App Router with Server Components as the default. Files under `app/` parse promised route inputs, compose feature entry points, and provide layouts; they do not contain business logic. `params` and `searchParams` are Promises in this version and must be awaited.

- *Why:* server-rendered catalog and account pages give the storefront strong SEO, small client bundles, and direct server-to-backend data access.
- *Consequence:* page data is fetched in `features/<name>/queries/`, never in client effects. Client Components are reserved for actual interaction.
- *Version discipline:* Next.js 16 differs from common older examples. Consult `node_modules/next/dist/docs/` before relying on framework behavior or file conventions.

### ADR-W002 — All-server BFF with one `apiFetch`

**Accepted.** Every backend request passes through the Next server and the server-only `apiFetch` in `lib/api/http.ts`.

```ts
type ApiAuthMode = "public" | "optional" | "required";

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: ApiAuthMode;
  cartSession?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
  headers?: HeadersInit;
};

declare function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T>;
```

- It prefixes `${API_URL}/api/v1`, sends only documented fields, unwraps `{ status, message, data, meta? }`, returns `undefined` for `204`, and throws `ApiError(status, code, message, errors)` for error envelopes.
- `auth` defaults to `"public"` and `cartSession` defaults to `false`; backend Public, Optional, and Auth modes map to `"public"`, `"optional"`, and `"required"`.
- For `auth: "optional"` or `auth: "required"`, `apiFetch` fetches a fresh Clerk session JWT with `auth()` → `getToken()` and attaches `Authorization: Bearer …` when appropriate. The token is never cached and never reaches browser JavaScript.
- For `cartSession: true`, `apiFetch` reads the server-held anonymous identity and attaches it as `X-Cart-Session` when present. Callers never set either identity header themselves.
- `API_URL` is server-only and is read through the validated `lib/env.ts` singleton, never through direct `process.env` access.

*Why:* a single server boundary keeps backend hosts, bearer tokens, cart tokens, envelope parsing, and error normalization out of the browser.

*Consequence:* Client Components use Server Actions or the two approved same-origin refetch handlers. They never know the backend URL or credentials.

### ADR-W003 — TanStack Query v5 owns interactive client state only

**Accepted.** TanStack Query is limited to the cart drawer/header badge, wishlist toggles, and coupon preview. Catalog, product, category, order, and account pages remain pure Server Components.

The documented cart wiring is:

1. The root layout reads `GET /cart` on the server and passes the cart to a small client boundary as `initialData`.
2. `useCart()` calls `useQuery` with `cartKeys.current`, `staleTime: 30_000`, and `refetchOnWindowFocus: true`.
3. A refetch calls the same-origin `app/api/cart/route.ts`, which is a thin server wrapper over `apiFetch`. Wishlist refetches use the only other interactive handler, `app/api/wishlist/route.ts`.
4. Interactive writes call a Server Action through `useMutation`. The action returns either the typed cart payload or a serializable `{ error: { code, message, errors } }`; it does not throw an expected API failure.
5. A successful cart mutation runs `queryClient.setQueryData(cartKeys.current, cart)`. The returned cart is authoritative; never invalidate and refetch it.
6. Wishlist toggles update optimistically and roll back to the snapshot on failure.

*Why:* this preserves instant interactive UI without duplicating server-rendered page state in a browser cache.

*Consequence:* route handlers exist only for TanStack refetches of interactive state. Page data never flows through them, and no third interactive route handler is added without revisiting this ADR.

### ADR-W004 — Form Server Actions and the shared `ActionState` system

**Accepted.** Form mutations use one Server Action per file and return the repository's existing `ActionState`.

The action pipeline is: Zod whitelist parse → `apiFetch` → `revalidatePath` → `toActionState` on success or `fromErrorToActionState` on failure. Actions return errors rather than throwing; only framework control flow such as `redirect()` or `notFound()` may escape.

- *Why:* this gives progressive form submission, server-only credentials, field-level validation, preserved payloads, and one consistent feedback model.
- *Consequence:* forms compose the shared `Form`, `FormControl`, `FieldError`, and `SubmitButton`. `Form` emits sonner feedback; redirect flows set the `toast` flash cookie and let `RedirectToast` display it after navigation.

Interactive cart and wishlist Server Actions are the separate typed-result style in ADR-W003: they return an authoritative payload or serializable error to `useMutation`, not `ActionState`.

### ADR-W005 — Guest-cart identity uses `sg_cart_session`

**Accepted.** The backend's browser cookie is not the storefront's identity mechanism because the browser never contacts the backend. Next owns an httpOnly cookie named `sg_cart_session`; `lib/cart-session.ts` exposes `getCartSession`, `setCartSession`, and `clearCartSession` using `cookies()` from `next/headers`.

- Apply a **capture-whenever-present** rule to `sessionToken`: inspect every cart response in a writable server context, persist the token with `setCartSession` before returning, and strip it from the client-facing cart payload. Do not assume only the first `POST /cart/items` can contain it.
- After every successful anonymous cart-aware mutation that keeps the guest cart active, if the response omits `sessionToken` but the request used an existing cookie token, call `setCartSession` again with that stored token. This refreshes the cookie's seven-day `maxAge` to mirror the backend's sliding `expiresAt`. Do not refresh failed calls, signed-in mutations, or pure Server Component reads.
- Cookie attributes are `httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, and `maxAge: 7 days`.
- Pass `cartSession: true` for every cart-aware backend request so `apiFetch` attaches `X-Cart-Session`: cart CRUD, `POST /coupons/validate`, `POST /orders/guest`, and the post-sign-in `GET /cart`.
- Cookie writes occur only in Server Actions or Route Handlers, never during Server Component rendering.
- Delete `sg_cart_session` on exactly three events: a successful merge from the post-sign-in `GET /cart`, a successful guest checkout, and a successful anonymous cart clear. Deletion takes precedence over refresh.
- The token never appears in URLs, logs, analytics, or client-side JavaScript.

*Why:* the backend still receives its supported header transport while the browser receives only an opaque, protected Next cookie.

*Consequence:* every cart response handled in a writable server context must run the capture/refresh/redact handling before its payload is returned to a Client Component. Server Component cart reads do not write cookies; under the current contract, `GET /cart` never mints the token.

### ADR-W006 — Clerk Next.js with guest-first gating

**Accepted.** Authentication uses Clerk for Next.js. The root `proxy.ts` uses `clerkMiddleware` to protect only `/account(.*)` by redirecting signed-out visitors to the sign-in route. Every other storefront route is public.

- *Why:* browsing, cart, coupon preview, guest checkout, and guest-order tracking must work before sign-in.
- *Consequence:* `proxy.ts` is an optimistic UX gate, not the security boundary; backend 401/403 responses remain authoritative. Optional-auth controls on public pages use an inline `<RequireAuth>` prompt rather than a route-level redirect. Clerk sign-in and sign-up catch-all pages live in the `(auth)` route group. The storefront has no role model.

### ADR-W007 — shadcn base-lyra, Tailwind v4, shared primitives first

**Accepted.** UI primitives use shadcn's `base-lyra` style on `@base-ui/react`. Tailwind v4 is CSS-first: semantic theme values live in `@theme` within `app/globals.css`; there is no `tailwind.config.*`.

- *Why:* the generated components provide an accessible base while semantic tokens keep storefront styling consistent.
- *Consequence:* do not assume Radix anatomy. Prefer existing `components/shared/` form, feedback, empty-state, spinner, redirect-toast, and badge primitives before creating storefront-specific shared components.

### ADR-W008 — Dynamic by default, cached public reads by exception

**Accepted.** `cacheComponents` is not enabled. In this Next.js 16 model, `fetch` is uncached by default; `apiFetch` makes that posture explicit with `cache: "no-store"` unless a caller supplies an approved cache policy. Public catalog queries may opt into `next: { revalidate: 60–300, tags: [...] }` for `GET /products`, `GET /products/:slug`, `GET /categories`, `GET /categories/:slug`, and `GET /products/:id/reviews`.

- *Why:* Next.js 16 does not cache `fetch` by default without Cache Components, while explicit public revalidation improves catalog latency and crawl performance.
- *Hard rule:* caching is allowed only when `(auth ?? "public") === "public"` and `cartSession !== true`. Optional and Required calls remain no-store even when no bearer token is currently attached, and cart-aware calls remain no-store even when no cookie is currently present. Fetch cache keys do not partition safely by identity headers, so `apiFetch` must assert against a violation during development.
- *Consequence:* cart, coupon, wishlist, checkout, profile, address, and order reads remain uncached. Cache Components and `'use cache'` are a deliberate later decision, not a Phase 0 shortcut.

## Repository layout

```text
sg-web-app/
├── app/                              ← thin App Router pages and layouts
│   ├── layout.tsx
│   ├── page.tsx                      ← /
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── guest/page.tsx
│   ├── orders/track/[token]/page.tsx
│   ├── account/
│   │   ├── page.tsx
│   │   ├── addresses/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── wishlist/page.tsx
│   └── api/
│       ├── cart/route.ts             ← TanStack refetch only
│       └── wishlist/route.ts         ← TanStack refetch only
├── features/<name>/
│   ├── components/
│   ├── hooks/
│   ├── actions/                      ← one Server Action per file
│   ├── queries/                      ← thin server-only apiFetch calls
│   ├── schema/
│   ├── types/
│   └── index.tsx                     ← default <Name>Feature Server Component
├── components/
│   ├── ui/                           ← shadcn primitives only
│   └── shared/                       ← shared form and storefront primitives
├── actions/
│   └── cookies.actions.ts
├── lib/
│   ├── utils.ts
│   ├── env.ts
│   ├── format.ts
│   ├── cart-session.ts
│   └── api/
│       ├── http.ts
│       ├── api-error.ts
│       └── redirect-on-auth-error.ts
├── docs/integration/storefront/      ← vendored backend contract, read-only
└── proxy.ts                          ← Clerk gate for /account(.*) only
```

There is no `src/` directory. `@/*` maps to the repository root. The route map is `/`, `/products`, `/products/[slug]`, `/categories`, `/categories/[slug]`, `/cart`, `/checkout`, `/checkout/guest`, `/orders/track/[token]`, `/account`, `/account/addresses`, `/account/orders`, `/account/orders/[id]`, and `/account/wishlist`, plus the Clerk catch-all routes and the two internal refetch handlers shown above.

The environment surface is exactly `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and server-only `API_URL`. All access goes through the validated `lib/env.ts` singleton; application code never reads `process.env` directly.

## Data flow

### Server-rendered read path

```text
app page/layout (await params and searchParams)
  → features/<name>/index.tsx
    → features/<name>/queries/*
      → lib/api/http.ts
        → sg-couture-api /api/v1
      ← unwrapped data/meta or ApiError
    ← typed Server Component props
  ← rendered HTML plus minimal client boundaries
```

Queries are thin and contain no business rules. Public catalog queries may declare revalidation and tags; all identity-bearing reads use `no-store`.

### Interactive path

```text
Client Component
  ├─ useQuery refetch
  │   → /api/cart or /api/wishlist Route Handler
  │     → apiFetch → backend
  │   ← typed interactive state
  └─ useMutation
      → Server Action
        → Zod parse → apiFetch → revalidatePath
      ← typed payload or serializable error
      → setQueryData, or optimistic wishlist update with rollback
```

Forms use the separate `ActionState` pipeline from ADR-W004. Server-renderable page data never enters this interactive path.

Three flows deserve names because multiple phases depend on them:

1. **Guest-cart identity flow** — a cart-aware Server Action or Route Handler calls `apiFetch` with `cartSession: true`, which reads `sg_cart_session` and attaches it as `X-Cart-Session`. Its **capture-whenever-present** step persists any returned `sessionToken`; after a successful anonymous mutation with no returned token, it instead re-writes the stored token to refresh the cookie's seven-day `maxAge`. It then removes `sessionToken` from the client payload. Delete `sg_cart_session` on exactly three events: successful merge, successful guest checkout, and successful anonymous cart clear; deletion takes precedence over refresh.
2. **Anonymous → user merge flow** — a small client effect watches Clerk session activation and calls `syncCartAction` once. That action performs `GET /cart` through `apiFetch` with `auth: "required"` and `cartSession: true`, so the request carries both identities; this overlap is the merge, because no merge endpoint exists. After success it calls `clearCartSession()`, returns the merged cart, and the client runs `setQueryData(cartKeys.current, cart)`. If the user had no cart, the backend adopts the anonymous cart without recomputing totals, so totals can remain stale until the next cart mutation; the UI must accept the returned values rather than recalculate them.
3. **Guest-order claim flow** — the email URL opens `/orders/track/[token]`. Its Server Component calls `GET /orders/guest/:token`. A signed-out visitor can track the order and sees an inline sign-in prompt for claiming. Once signed in, `claimOrderAction` calls `POST /orders/claim`, sets the success flash toast, and redirects to `/account/orders/[id]`. The token is one-shot; invalid, expired, and consumed tokens all render the same generic invalid-or-expired message.

## State ownership matrix

| State | Owner | Persistence / rule |
|---|---|---|
| Catalog, product, category, public reviews, account pages, order pages | Server Component props | Per render; eligible Public reads may use tagged fetch revalidation |
| Cart drawer, header badge, coupon preview | TanStack Query cache | Browser memory; cart starts from root-layout `initialData` |
| Wishlist toggle state | TanStack Query cache | Browser memory; optimistic with rollback |
| Filters, sorting, and pagination | URL through nuqs | Shareable URL; API wire names and formats |
| Guest cart identity | httpOnly `sg_cart_session` cookie | Sliding seven days after successful anonymous mutations; server-only read/write; sent upstream as `X-Cart-Session` |
| Redirect success feedback | `toast` flash cookie | Consumed by `RedirectToast` after navigation |
| Signed-in identity and session | Clerk | Fresh server-side JWT per backend request; JWT never enters application client state |
| Local disclosure state | Nearest Client Component | Non-persistent; only menus, dialogs, drawers, and similar UI state |

## Integration points & failure domains

- **Auth failures:** backend responses are the real gate. `redirectOnAuthError` applies only in Auth-mode contexts. It must not redirect from Public or Optional calls, where an absent or invalid token means guest behavior. The copied admin implementation invokes it unconditionally and must be made mode-aware in Phase 0.
- **`ACCOUNT_DISABLED` (403):** when a supplied Clerk identity resolves to a disabled account, sign out and render the dedicated disabled-account state. Handle this centrally rather than independently in each feature.
- **Rate limits (429):** disable buttons while a request is in flight, never automatically retry mutations, and preserve the current form values and cart cache so the customer can retry after backoff.
- **Stale stock and price:** catalog and cart values are display hints. Cart and checkout reconcile against server truth. For `INSUFFICIENT_STOCK` and `INVALID_VARIANT`, use the structured `errors[]` to annotate matching lines, refresh `GET /cart` when the checkout contract requires it, and let the customer correct or remove the line. Never parse the human message or recompute totals.
- **Network and backend failures:** render recoverable error states for reads; return serializable action errors for writes. Do not turn failed Optional requests into authentication redirects.

## What we'll revisit

- Enablement of Cache Components and `'use cache'` after measuring the explicit fetch-cache model.
- `CARD` checkout and the Geidea payment-session seam. Until the backend phase ships, sending `CARD` returns `422 PAYMENT_METHOD_UNAVAILABLE`; only `CASH` is offered.
- User-facing notifications after the backend contract exposes them.
