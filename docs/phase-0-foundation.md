# Phase 0 — Foundation

**Objective:** a running SG Couture storefront shell with the complete web infrastructure: a server-only backend client, Clerk, TanStack Query, nuqs, the shared `ActionState` form system, cart-session cookie helpers, design tokens, and a responsive layout. Every later phase should add feature modules without changing these foundations.

**Prerequisites:** the backend is reachable in a development environment; a Clerk test instance supplies publishable and secret keys; `docs/integration/storefront/` is present and remains read-only.

**API surface:** `GET /categories` is consumed only for the final smoke check. The infrastructure implements the auth modes, envelopes, errors, pagination metadata, decimal-string money, and 204 behavior in `docs/integration/storefront/00-conventions.md`.

## Tasks

### 0.1 Complete the scaffold and shadcn baseline

- [x] Keep the existing Next.js 16.2.10 App Router scaffold with no `src/` directory, strict TypeScript, `@/*` mapped to the repository root, and Bun-only scripts; do not add a test runner.
- [x] Add the remaining runtime dependencies with Bun: `@clerk/nextjs`, `@tanstack/react-query`, `nuqs`, `server-only`, `sonner`, and `zod`. Keep the already-installed shadcn, `@base-ui/react`, `lucide-react`, Tailwind v4, and class utility packages.
- [x] Reconcile `components.json` to the `base-lyra` preset on `@base-ui/react`, RSC mode, Tailwind v4 CSS at `app/globals.css`, the existing `@/*` aliases, and Lucide icons. Inspect existing generated files before updating them.
- [x] Generate the shadcn primitives needed by the copied shared layer and first three phases, including `button`, `badge`, `input`, `label`, `field`, `card`, `separator`, `skeleton`, `alert`, `sheet`, `alert-dialog`, `select`, `toggle-group`, and `pagination`; use the generated base APIs, including `render` rather than Radix-only composition props.
- [x] Retain and verify `lib/utils.ts` as the single `cn()` helper. Add semantic `Badge` variants such as `success` and `warning` so copied status badges never require raw status colors.
- [x] Establish the required layout only: thin route files under `app/`; `features/<name>/{components,hooks,actions,queries,schema,types,index.tsx}`; `lib/{api,env,format,cart-session}`; `components/{ui,shared}`; and cross-cutting actions under `actions/`. Do not create empty feature placeholders.

### 0.2 Wire the copied shared components

- [x] Audit every file under `components/shared/` and make the copied `Form`, `FormControl`, `SubmitButton`, `EmptyState`, `Spinner`, `RedirectToast`, `ActiveBadge`, and `PaymentStatusBadge` compile against the generated primitives. Adapt `FormControl` to the generated `Field` anatomy, and preserve `<ComponentName>Props`, kebab-case files, accessible field errors, semantic tokens, and `Lucide`-prefixed icon imports.
- [x] Create `lib/api/api-error.ts` with a serializable `ErrorCode`, normalized validation entries, and `ApiError(status, code, message, errors)`. Keep structured business-error payloads intact and branch on `code`, never response text.
- [x] Create `lib/api/redirect-on-auth-error.ts` so redirects are possible only for calls explicitly made in Auth mode. Public and Optional calls must return their errors to the caller, including `ACCOUNT_DISABLED`, rather than being converted into auth redirects.
- [x] Update the copied `ActionState` conversion utilities for Zod v4 (`z.flattenError`) and the new `ApiError` shape. They must preserve repeated form values and return errors instead of throwing; only `redirect()` and `notFound()` may escape a Server Action.
- [x] Create `actions/cookies.actions.ts` with server-only get, set, and delete helpers for the `toast` flash cookie used by `RedirectToast`. Mount Sonner's `Toaster` once so both forms and redirect feedback work.
- [x] Add a reusable shared `ConfirmDialog` composed from the generated `AlertDialog`; destructive actions in later phases must use it and its trigger must follow base-ui composition.

### 0.3 Environment, backend client, formatting, and cart session

Implement this exact public API in `lib/api/http.ts`:

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

- [ ] Create a validated `lib/env.ts` singleton providing exactly `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and server-only `API_URL`. No other file may read `process.env` directly.
- [ ] Create `lib/api/http.ts`, mark it `server-only`, and implement `apiFetch<T>()` against `${API_URL}/api/v1`. It must unwrap `{ status, message, data, meta? }`, preserve pagination metadata, map error envelopes to `ApiError`, return `undefined` for 204, and never send the backend origin to browser code.
- [ ] Default `auth` to `"public"` and `cartSession` to `false`; map backend Public, Optional, and Auth modes to `"public"`, `"optional"`, and `"required"`. For Optional/Required, `apiFetch` obtains a fresh Clerk JWT per request with `await auth()` then `getToken()` and attaches it only server-side. For `cartSession: true`, `apiFetch` reads `sg_cart_session` itself and attaches `X-Cart-Session` when present. Reject caller-supplied `Authorization` and `X-Cart-Session` headers.
- [ ] Default every backend request to `cache: "no-store"`. Allow per-call `next: { revalidate, tags }` passthrough only when `(auth ?? "public") === "public"` and `cartSession !== true`; add a development assertion that rejects any cache metadata on Optional, Required, or cart-aware calls even when no identity value is currently present.
- [ ] Create `lib/format.ts` with decimal-string-safe `formatEGP()` and date formatting. Verify `"2400"`, `"2040.5"`, and `"65.00"` produce consistent EGP output without floating-point arithmetic.
- [ ] Create `lib/cart-session.ts` around async `cookies()` with `getCartSession()`, `setCartSession()`, and `clearCartSession()`. The only cart cookie is `sg_cart_session`, set with `httpOnly: true`, `secure: true`, `sameSite: "lax"`, `path: "/"`, and `maxAge: 7 days`; `setCartSession()` must support re-writing the stored token so successful anonymous cart mutations can refresh that `maxAge`. Writes are legal only from Server Actions and Route Handlers.

### 0.4 Providers and route protection

- [ ] Create `app/providers.tsx` as a narrow Client Component and compose, inside `<body>`, `ClerkProvider` → `QueryClientProvider` → `NuqsAdapter` → application children, with one mounted `Toaster`.
- [ ] Construct one browser `QueryClient` lazily with `useState`. Queries never retry 4xx `ApiError`s and retry other failures at most twice; mutations have `retry: 0`. Feature hooks own their stale-time and focus policies.
- [ ] Create root `proxy.ts` with `clerkMiddleware` and a public-first `createRouteMatcher` that protects only `/account(.*)`. Keep catalog, cart, checkout, tracking, auth pages, and the two same-origin refetch handlers public at this layer; backend 401/403 responses remain authoritative.
- [ ] Add a temporary Phase 0 Clerk sign-in/sign-out round trip through Header controls without moving JWT access into a Client Component. Dedicated catch-all auth pages and return-URL behavior are completed in Phase 3.

### 0.5 Responsive storefront shell

- [ ] Replace scaffold metadata and page chrome with the SG Couture root layout, keeping `app/` pages thin and Server Components by default.
- [ ] Build a responsive Header with logo, links for Home, Products, and Categories, a cart-drawer placeholder with a badge slot, and Clerk signed-out/signed-in controls. Use `LucideShoppingBag`-style imports and accessible labels.
- [ ] Build the Footer and stable main-content region so later route segments share the same shell without duplicating navigation.
- [ ] Normalize `app/globals.css` to Tailwind v4 CSS-first `@theme` tokens for typography, spacing-facing semantic colors, radii, borders, focus, and storefront status variants. Components use semantic utilities and generated primitives rather than raw colors.
- [ ] Add route-level loading, error, empty, and not-found foundations with the copied shared components and generated `Skeleton`/`Alert` primitives where appropriate.

### 0.6 Live smoke verification

- [ ] Replace the scaffold home page with a thin RSC page that renders a `HomeFeature`; its query calls `GET /categories` through Public `apiFetch` and renders live category names from the unwrapped payload.
- [ ] Verify the smoke query through a normal navigation, hard refresh, new tab, and incognito window. Simulate a backend failure and confirm the route error/retry UI is usable without client-side page-data fetching.
- [ ] Run `bun lint` and `bunx tsc --noEmit`, then audit client bundles and source for backend URLs, Clerk JWTs, and the cart token.

## Definition of Done

- `bun dev` renders the responsive shell and live category names from `GET /categories`.
- Hard refresh, new-tab navigation, and an incognito visit all render correctly.
- Clerk sign-in and sign-out complete a round trip; `/account` is protected while the catalog shell remains public.
- `bun lint` and `bunx tsc --noEmit` are green.
- `process.env` appears only in `lib/env.ts`; no browser code can access `API_URL`, a Clerk JWT, or a cart-session token.
- The copied shared form and feedback components compile and render against shadcn base-lyra on `@base-ui/react`.

## Out of scope

Real catalog presentation beyond the live category smoke list, cart behavior, dedicated auth pages, merge behavior, profile editing, wishlist, checkout, and orders.
