# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo is the **SG Couture web storefront** — a standalone Next.js 16 App Router frontend that consumes the separate `sg-couture-api` backend REST API. It has **no database and no backend of its own**. The API contract lives in `docs/integration/storefront/` (vendored from the backend repo, read-only) — **never edit it, and never invent endpoints or fields not documented there**. Start at `docs/README.md` for the development plan and status tracker.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

## Engineering approach

- Act as a **senior Next.js developer**. Always apply Next.js-first patterns and architecture decisions — App Router, Server Components, Server Actions, route handlers, middleware (`proxy.ts`), layouts/route segments, data fetching/caching conventions (`revalidatePath`, `server-only`) — never fall back to generic React/Express-style approaches (client-side fetching, `useEffect` data loading, client state for server data) when a Next.js-idiomatic one exists.
- When stuck, or before implementing against a third-party library/framework you're unsure about, you MUST pull fresh official documentation instead of relying on possibly stale memory — use your available agents, especially **`docs-explorer`**.
- Before committing to any architecture decision, deviation from documented conventions, or refactor touching 3+ files, consult the **`fable-advisor`** subagent and act on its verdict — treat a `Flag` as blocking until resolved (fix the plan, or explain to the user why the flag doesn't apply) before writing code.

@AGENTS.md

## Commands

Always use **Bun** — never `npm`, `npx`, or `yarn`.

```bash
bun dev                        # start dev server
bun run build                  # production build
bun lint                       # ESLint
bunx tsc --noEmit              # type-check only, no build
bunx shadcn@latest add <item>  # install a shadcn primitive
```

No automated test suite is configured. Rely on `bun lint`, `bunx tsc --noEmit`, `bun run build`, and manual browser verification.

## Git

- Commit messages must **not** include a `Co-Authored-By` trailer or any Claude Code / AI-attribution line.

## Implementation status

This is a greenfield storefront. Phase 0 is **in progress**: the Next.js scaffold, shadcn/base-ui dependencies, and `components/shared/` primitives have landed. Phases 1–7 have **not started**. `docs/README.md` is the single status tracker — keep its table current when starting or finishing a phase.

**Deferred backend capabilities — do not build against them:** `CARD` checkout returns `422 PAYMENT_METHOD_UNAVAILABLE` until backend Phase 7, and no storefront user-notification endpoints exist yet. Ship CASH-only checkout and no notification feature.

## Architecture

- **Reads**: Pure Server Component pages call server-only `apiFetch` through thin `queries/`. `apiFetch` fetches a fresh Clerk JWT per request when the endpoint's auth mode needs one. The browser never calls the backend, and the JWT never reaches client code.
- **Mutations**: Server Actions use two result styles. Interactive cart/wishlist actions return an authoritative typed payload or serializable error to `useMutation`; form actions for profile, addresses, reviews, and checkout return `ActionState` through Zod whitelist parse → `apiFetch` → `revalidatePath` → `toActionState`, with failures converted by `fromErrorToActionState`. Expected failures do not throw; only `redirect` or `notFound` may escape. Use `formData.getAll(...)` for repeated fields because `Object.fromEntries(formData)` collapses them.
- **Interactive state**: TanStack Query v5 owns only the cart drawer/badge, wishlist toggles, and coupon preview. The root layout passes the server-read cart as `initialData` to `useCart()`. Refetches go only through thin `app/api/cart/route.ts` and `app/api/wishlist/route.ts`; page data never does. Interactive mutations use `useMutation` with a Server Action as `mutationFn` returning a typed payload; successful cart mutations use their authoritative payload with `setQueryData`, never invalidate-refetch. Wishlist toggles are optimistic with rollback. **If a Server Component can render it, TanStack Query must not own it.**
- **Guest cart**: `lib/cart-session.ts` captures `sessionToken` whenever present in any cart response and overwrites the httpOnly `sg_cart_session` cookie. After every successful anonymous cart-aware mutation that returns no token, re-write the stored token with `setCartSession()` to refresh its seven-day `maxAge`; do not refresh failed or signed-in mutations or pure RSC reads. `apiFetch({ cartSession: true })` attaches it as `X-Cart-Session` on cart CRUD, `POST /coupons/validate`, `POST /orders/guest`, and the post-sign-in `GET /cart`. Never expose it in URLs, logs, analytics, or client JavaScript. Delete it on exactly three events: a successful implicit merge after the post-sign-in `GET /cart`, successful guest checkout, and anonymous cart clear; deletion takes precedence over refresh.
- **URL state**: nuqs provides one params schema per feature, split by client/server boundary — a plain `hooks/<feature>-search-params.ts` (no directive) exporting the parsers/`createSearchParamsCache`/type, and a `"use client"` `hooks/use-<feature>-params.ts` wrapping `useQueryStates` with `shallow: false`. Server Components must import the cache/mapper/type from the plain module, never from the `"use client"` one — calling a server-only export from a client-directive file throws at runtime even though it type-checks. Param names match the API wire format. Do not use `useState` for filters or pagination. In Next.js 16, `params` and `searchParams` are Promises.
- **Security**: Backend 401/403 responses are the real gate. `proxy.ts` with `clerkMiddleware` protects `/account(.*)` only; elsewhere, inline `<RequireAuth>` prompts instead of hard redirects. The app is guest-first and has no roles.
- **`apiFetch`** (`lib/api/http.ts`): prefixes `${API_URL}/api/v1`, defaults to `cache: "no-store"`, unwraps `{ status, message, data, meta }`, throws `ApiError(status, code, message, errors)`, and returns `undefined` for 204. It fetches and attaches a fresh Clerk bearer token for `auth: "optional" | "required"`, and reads and attaches `sg_cart_session` for `cartSession: true`; callers never set those identity headers. Cache metadata is allowed only when `(auth ?? "public") === "public"` and `cartSession !== true`.

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

`auth` defaults to `"public"`; `cartSession` defaults to `false`. Backend Public, Optional, and Auth modes map to `"public"`, `"optional"`, and `"required"`.

Full specs: `docs/00-architecture.md` and `docs/01-conventions.md`.

## Project layout

No `src/` — `@/*` maps to the repo root.

```text
app/                         # thin pages/layouts only; no feature logic
  api/{cart,wishlist}/       # the only route handlers; interactive refetch only
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

One file per Server Action. `queries/` are thin server-only `apiFetch` calls with no business logic; the backend owns business rules.

Routes are `/`, `/products`, `/products/[slug]`, `/categories`, `/categories/[slug]`, `/cart`, `/checkout`, `/checkout/guest`, `/orders/track/[token]`, gated `/account`, `/account/addresses`, `/account/orders`, `/account/orders/[id]`, `/account/wishlist`, and auth catch-alls for sign-in/sign-up.

## Server Action patterns

Interactive cart and wishlist actions used by `useMutation` return typed results, not `ActionState`:

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

`captureRefreshAndSanitizeCart` applies the capture-whenever-present rule, re-writes the existing token after a successful anonymous mutation when no new token is returned, and strips `sessionToken`. The three deletion events override refresh. A mutation `onSuccess` branches on `"error" in result`; only a returned `Cart` is written with `setQueryData`.

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
    return fromErrorToActionState(error, "required", formData);
  }
}
```

Schemas are whitelists because unknown API fields return 422. Use `formData.getAll(...)` for multi-value form inputs. Forms wire `useActionState` and render shared `Form`, `FormControl`, and `SubmitButton`; `Form` auto-toasts. Redirect flows use `setCookieByKey("toast", ...)` plus `redirect()`, with `RedirectToast` showing the flash toast.

## Auth

- The storefront is guest-first and has no roles.
- API auth modes are **Public**, **Optional**, and **Auth**. Match each endpoint's documented mode.
- For Optional/Auth endpoints, pass `auth: "optional"` or `auth: "required"`; `apiFetch` fetches and attaches the fresh Clerk session JWT server-side. Never set, cache, or expose the token in feature code.
- `proxy.ts` protects `/account(.*)` for UX. Elsewhere use inline `<RequireAuth>` prompts; backend 401/403 responses remain authoritative.

## API conventions (crib — full table in docs/integration/storefront/00-conventions.md)

- Success envelope: `{ status: "success", message, data, meta? }`; error envelope: `{ status: "error", message, code, errors? }`. Branch on `code`, never `message`. DELETE success is 204 with an empty body.
- Money is a decimal **string with variable scale** (`"2400"`, `"65.00"`, EGP). Format with `formatEGP()` and do zero client-side money math.
- Bodies are strict: unknown fields return 422. Never send undocumented or server-owned fields such as slugs, computed prices/discounts, stock/sold counts, ratings, order totals, or usage counts.
- Pagination sends `page`/`limit` and reads `meta { page, limit, totalItems, totalPages, hasNext, hasPrev }`; keep it server-rendered and URL-driven.
- Rate limits: checkout, guest checkout, and claim are 5/60s; coupon validation and guest-order lookup are 10/60s; global is 100/60s. Never auto-retry mutations or poll in tight loops.
- `INSUFFICIENT_STOCK` and `INVALID_VARIANT` include structured line errors; map them back to cart lines and let the customer correct them.
- Checkout is CASH-only. Sending `CARD` returns `422 PAYMENT_METHOD_UNAVAILABLE` until the backend ships it. No storefront notification endpoints exist yet.

## UI

- shadcn style is **base-lyra on `@base-ui/react`, not Radix**. Inspect generated component anatomy before applying library patterns.
- Tailwind v4 is CSS-first: theme in `app/globals.css` via `@theme`; no `tailwind.config.*`.
- Prefer `components/shared/` primitives. Use semantic `Badge` variants (`success`, `warning`, `info`, `destructive`, `secondary`, `outline`), never literal color classes.
- Pages are RSC-first. TanStack Query is only for the explicitly interactive cart, wishlist, and coupon surfaces.

## Naming & style

- Prefix component prop types with the component name: `ProductCardProps`, never `Props`.
- Lucide icons always use the `Lucide` prefix: `LucideSearch`, never `Search`.
- Files are kebab-case. Feature default exports are named `<Name>Feature`.
- Hand-write API response types from the contract docs.

## Zod v4

- `z.enum()` accepts enum-like objects; `z.nativeEnum()` is deprecated. Use the singular `.enum` accessor.
- `error.flatten()` is deprecated; prefer `z.flattenError(error)`.
- Use top-level formats such as `z.url()` and `z.email()`, not `z.string().url()` or `z.string().email()`.

## Environment

Exactly three variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `API_URL`. `API_URL` is server-only and must not use `NEXT_PUBLIC_`. Access them through the validated `lib/env.ts` singleton, never `process.env` directly.
