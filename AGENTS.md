This file provides guidance to Codex when working in this repository.

This repo is the **SG Couture web storefront**: a standalone Next.js 16 App
Router frontend that consumes the separate `sg-couture-api` backend REST API.

It has **no database and no backend of its own**. The API contract lives in
`docs/integration/storefront/` (vendored from the backend repo, read-only).
Never edit it or invent endpoints or fields not documented there. Start at
`docs/README.md` for the development plan and status tracker.

Keep replies concise and focus on the key information. Avoid unnecessary fluff
and long code snippets.

## Engineering Approach

- Act as a **senior Next.js developer**. Always apply Next.js-first patterns
  and architecture decisions — App Router, Server Components, Server Actions,
  route handlers, middleware (`proxy.ts`), layouts/route segments, data
  fetching/caching conventions (`revalidatePath`, `server-only`) — never fall
  back to generic React/Express-style approaches (client-side fetching,
  `useEffect` data loading, client state for server data) when a
  Next.js-idiomatic one exists.
- When stuck, or before implementing against a third-party library/framework
  you're unsure about, you MUST pull fresh official documentation instead of
  relying on possibly stale memory — use your available agents, especially
  **`docs-explorer`**.
- Before committing to any architecture decision, deviation from documented
  conventions, or refactor touching 3+ files, consult the **`fable-advisor`**
  subagent and act on its verdict — treat a `Flag` as blocking until resolved
  (fix the plan, or explain to the user why the flag doesn't apply) before
  writing code.

## Commands

Always use **Bun**. Never use `npm`, `npx`, or `yarn`.

```bash
bun dev                        # start dev server
bun run build                  # production build
bun lint                       # ESLint
bunx tsc --noEmit              # type-check only, no build
bunx shadcn@latest add <item>  # install a shadcn primitive
```

No automated test suite is configured. Verify with lint, type-check, build, and
the browser. Git commits must not contain `Co-Authored-By` or AI-attribution
trailers.

## Implementation Status

`docs/README.md` is the single status tracker; keep it current when starting or
finishing a phase. This is a greenfield storefront: Phase 0 is in progress
(scaffold, shadcn/base-ui dependencies, and shared primitives landed), while
Phases 1–7 have not started. Do not build `CARD` checkout while it returns
`422 PAYMENT_METHOD_UNAVAILABLE`, or user notifications before storefront
notification endpoints exist.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all
differ from training data. Read the relevant guide in `node_modules/next/dist/docs/`
before writing any Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architecture

- **Reads**: Pure Server Component pages use thin `queries/` that call the
  server-only `apiFetch`. For endpoints that need identity, `apiFetch` fetches a
  fresh Clerk JWT per request. The browser never calls the backend, and Clerk
  tokens never reach the client.
- **Mutations**: Server Actions use two result styles. Interactive cart/wishlist
  actions return an authoritative typed payload or serializable error to
  `useMutation`. Form actions for profile, addresses, reviews, and checkout
  return `ActionState`: Zod whitelist parse, call `apiFetch`, then
  `revalidatePath` and `toActionState`; convert failures with
  `fromErrorToActionState`. Expected failures do not throw; only `redirect` or
  `notFound` may escape.
- **Interactive state**: TanStack Query v5 owns only the cart drawer/badge,
  wishlist toggles, and coupon preview. The root layout supplies the server-read
  cart as `initialData` to `useCart()`. Refetch only through thin
  `app/api/{cart,wishlist}/route.ts` handlers. Interactive mutations use Server
  Actions as `useMutation` mutation functions returning typed payloads. On cart
  success, write the authoritative payload with `setQueryData`; never
  invalidate-refetch. Wishlist
  toggles use optimistic updates with rollback. If a Server Component can render
  it, TanStack Query must not own it.
- **Guest cart**: `lib/cart-session.ts` captures `sessionToken` whenever present
  and overwrites the httpOnly `sg_cart_session` cookie. After every successful
  anonymous cart-aware mutation that returns no token, re-write the stored token
  with `setCartSession()` to refresh its seven-day `maxAge`; do not refresh
  failed or signed-in mutations or pure RSC reads. `apiFetch({ cartSession:
  true })` attaches it as `X-Cart-Session` on cart CRUD,
  `POST /coupons/validate`, `POST /orders/guest`, and post-sign-in `GET /cart`.
  Never expose it in URLs, logs, analytics, or client JavaScript. Delete it on
  exactly three events: successful implicit merge after post-sign-in
  `GET /cart`, successful guest checkout, and anonymous cart clear; deletion
  takes precedence over refresh.
- **URL state**: Use nuqs. One params schema per feature
  (`hooks/use-<feature>-params.ts`) drives `createSearchParamsCache` and
  `useQueryStates` with `shallow: false`; names match the API wire format. Never
  use `useState` for filters or pagination. Next.js 16 `params` and
  `searchParams` are Promises.
- **Security**: Backend 401/403 responses are the real gate. `proxy.ts` with
  `clerkMiddleware` protects `/account(.*)` only. Use inline `<RequireAuth>`
  prompts elsewhere, never hard redirects. The storefront is guest-first and
  has no roles.
- **`apiFetch`** (`lib/api/http.ts`): prefix `${API_URL}/api/v1`; default to
  `cache: "no-store"`; unwrap `{ status, message, data, meta }`; throw
  `ApiError(status, code, message, errors)`; return `undefined` for 204. It
  fetches and attaches a fresh Clerk bearer token for `auth: "optional" |
  "required"`, and reads and attaches `sg_cart_session` for `cartSession: true`;
  callers never set those identity headers. Cache metadata is allowed only when
  `(auth ?? "public") === "public"` and `cartSession !== true`.

The public API is identical everywhere:

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

`auth` defaults to `"public"`; `cartSession` defaults to `false`. Backend Public,
Optional, and Auth modes map to `"public"`, `"optional"`, and `"required"`.

Full specs: `docs/00-architecture.md` and `docs/01-conventions.md`.

## Project Layout

No `src/` directory. `@/*` maps to the repo root.

```text
app/                         # thin pages/layouts only; no feature logic
  api/{cart,wishlist}/       # only route handlers; interactive refetch only
  (auth)/sign-in/[[...sign-in]]/
  (auth)/sign-up/[[...sign-up]]/
  products/[slug]/
  categories/[slug]/
  checkout/guest/
  orders/track/[token]/
  account/{addresses,orders,wishlist}/
  account/orders/[id]/
features/<name>/             # components/ hooks/ actions/ queries/ schema/ types/ index.tsx
                             # index.tsx exports default <Name>Feature (Server Component)
lib/                         # utils.ts, env.ts, format.ts, cart-session.ts, api/
components/ui/               # shadcn primitives only (base-lyra on @base-ui/react)
components/shared/           # form system, form-control, submit-button, empty-state,
                             # spinner, redirect-toast, active-badge,
                             # payment-status-badge; prefer these
actions/                     # cross-cutting Server Actions, e.g. cookies.actions.ts
proxy.ts                     # Clerk UX gate for /account(.*) only
```

Use one file per Server Action. `queries/` are thin server-only `apiFetch` calls
with no business logic; the backend owns business rules.

Routes are `/`, `/products`, `/products/[slug]`, `/categories`,
`/categories/[slug]`, `/cart`, `/checkout`, `/checkout/guest`,
`/orders/track/[token]`, gated `/account`, `/account/addresses`,
`/account/orders`, `/account/orders/[id]`, `/account/wishlist`, and auth
catch-alls for sign-in/sign-up.

## Server Action Patterns

Interactive cart and wishlist actions used by `useMutation` return typed results,
not `ActionState`:

```ts
type InteractiveActionError = {
  error: { code: string; message: string; errors?: unknown };
};

type CartActionResult = Cart | InteractiveActionError;

export async function addCartItemAction(input: unknown): Promise<CartActionResult> {
  try {
    const parsedInput = addCartItemSchema.parse(input);
    const existingSession = await getCartSession();
    const transportCart = await apiFetch<CartTransport>("/cart/items", {
      method: "POST",
      body: parsedInput,
      auth: "optional",
      cartSession: true,
    });
    const cart = await captureRefreshAndSanitizeCart(
      transportCart,
      existingSession,
    );
    revalidatePath("/cart");
    return cart;
  } catch (error) {
    return { error: toInteractiveActionError(error) };
  }
}
```

`captureRefreshAndSanitizeCart` applies the capture-whenever-present rule,
re-writes the existing token after a successful anonymous mutation when no new
token is returned, and strips `sessionToken`. The three deletion events override
refresh. A mutation `onSuccess` branches on `"error" in result`; only a returned
`Cart` is written with `setQueryData`.

Form actions keep the `ActionState` skeleton:

```ts
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = updateProfileSchema.parse(Object.fromEntries(formData));
    await apiFetch("/users/me", {
      method: "PATCH",
      body: input,
      auth: "required",
    });
    revalidatePath("/account");
    return toActionState("SUCCESS", "Saved", formData);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
```

Schemas are whitelists because unknown fields return 422. Use
`formData.getAll(...)` for multi-value form inputs because
`Object.fromEntries(formData)` collapses repeated keys.
Forms wire `useActionState` and render shared `Form`, `FormControl`, and
`SubmitButton`; `Form` auto-toasts. Redirect flows use
`setCookieByKey("toast", ...)` plus `redirect()`, with `RedirectToast` displaying
the flash toast.

## Auth

- The storefront is guest-first and has no roles.
- API auth modes are Public, Optional, and Auth; follow the documented mode for
  each endpoint.
- For Optional/Auth endpoints, pass `auth: "optional"` or `auth: "required"`;
  `apiFetch` fetches and attaches the fresh Clerk JWT server-side. Never set,
  cache, or expose the token in feature code.
- `proxy.ts` gates `/account(.*)` for UX; inline `<RequireAuth>` prompts protect
  authenticated actions elsewhere. Backend responses are authoritative.

## API Conventions

Full table: `docs/integration/storefront/00-conventions.md`.

- Success envelope: `{ status: "success", message, data, meta? }`.
- Error envelope: `{ status: "error", message, code, errors? }`.
- Branch on `code`, never on `message`.
- DELETE success returns 204 with an empty body.
- Money is a decimal string with variable scale, such as `"2400"` or
  `"65.00"`. Format EGP with `formatEGP()` and never do client-side money math.
- Request bodies are strict; unknown fields return 422. Never send undocumented
  or server-owned fields, including slugs, computed prices/discounts,
  stock/sold counts, ratings, order totals, or usage counts.
- Pagination uses `page`/`limit` and
  `meta { page, limit, totalItems, totalPages, hasNext, hasPrev }`; keep it
  server-rendered and URL-driven.
- Checkout, guest checkout, and claim are limited to 5/60s; coupon validation
  and guest lookup to 10/60s; all other routes default to 100/60s. Never
  auto-retry mutations or poll tightly.
- Map structured `INSUFFICIENT_STOCK` and `INVALID_VARIANT` errors to cart lines.
- Checkout is CASH-only. `CARD` returns `422 PAYMENT_METHOD_UNAVAILABLE`, and no
  storefront notification endpoints exist yet.

## UI

- shadcn style is **base-lyra on `@base-ui/react`**, not Radix. Check generated
  component anatomy before assuming library patterns.
- Tailwind v4 is CSS-first. Theme lives in `app/globals.css` via `@theme`; there
  is no `tailwind.config.*`.
- Prefer `components/shared/` primitives.
- Badge colors use semantic variants (`success`, `warning`, `info`,
  `destructive`, `secondary`, `outline`), never literal color classes.
- Pages are RSC-first; TanStack Query is only for the designated interactive
  cart, wishlist, and coupon state.

## Naming And Style

- Component prop types are prefixed with the component name:
  `ProductCardProps`, never `Props`.
- Lucide icons always use the `Lucide` prefix: `LucideSearch`, never `Search`.
- Files are kebab-case.
- Feature default exports are named `<Name>Feature`.
- API response types are hand-written from the contract docs.

## Zod v4

- `z.enum()` accepts enum-like objects; `z.nativeEnum()` is deprecated.
- Use the singular `.enum` accessor.
- `error.flatten()` is deprecated. Prefer `z.flattenError(error)`.
- Use top-level formats such as `z.url()` and `z.email()`, not
  `z.string().url()` or `z.string().email()`.

## Environment

Exactly these environment variables are expected:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `API_URL`

`API_URL` is server-only and must not use `NEXT_PUBLIC_`. Access all variables
through the validated `lib/env.ts` singleton, never `process.env` directly.
