# 01 — App Conventions (read before any phase)

Companion to the backend guide's `00-conventions.md`. That guide defines the wire contract; this document defines how the Next.js storefront consumes it. If they conflict, the backend guide wins.

## 1. `apiFetch` and `ApiError`

All backend traffic uses the server-only `apiFetch` in `lib/api/http.ts`. The browser never contacts the backend directly.

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

- `auth` defaults to `"public"`; `cartSession` defaults to `false`. The backend contract labels Public, Optional, and Auth map to `"public"`, `"optional"`, and `"required"` respectively.
- Prefix `path` with `${API_URL}/api/v1`, where `API_URL` comes from the validated `lib/env.ts` singleton.
- Serialize `body` as JSON and set the appropriate content type. Never pass browser cookies through to the backend.
- For `auth: "optional"` or `auth: "required"`, `apiFetch` obtains a fresh Clerk token with `auth()` → `getToken()` for each request and attaches `Authorization: Bearer …` when appropriate. It never caches or exposes that JWT.
- For `cartSession: true`, `apiFetch` reads `sg_cart_session` server-side and attaches it as `X-Cart-Session` when present. Use this option for cart CRUD, `POST /coupons/validate`, `POST /orders/guest`, and post-sign-in `GET /cart`.
- Callers never set `Authorization` or `X-Cart-Session` through `headers`; those reserved identity headers are centralized in `apiFetch`.
- Unwrap successful `{ status, message, data, meta? }` responses into the typed domain result. List wrappers retain the documented `meta` beside `data`.
- Return `undefined` for `204 No Content` without attempting JSON parsing.
- Convert error envelopes into `ApiError(status, code, message, errors)`. Branch on `code`, never on `message`; unknown future codes use generic fallback UI.

```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}
```

`apiFetch` defaults to `cache: "no-store"` and passes explicit `cache` and `next` options through to `fetch`. With `cacheComponents` disabled, Next.js 16 does not cache `fetch` by default; the explicit default documents intent. Caching, positive revalidation, and cache tags are permitted only when `(auth ?? "public") === "public"` and `cartSession !== true`. During development, assert and fail when any other option combination requests cache metadata, even when an Optional call currently has no signed-in user or a cart-aware call currently has no cookie; fetch cache keys do not partition safely on identity headers. Approved cached reads are public products, product detail, categories, category detail, and public reviews with 60–300 second revalidation and semantic tags.

Keep typed error narrowers in the API layer:

- `getStockErrors(error)` narrows `INSUFFICIENT_STOCK` to `{ productId; requested; available }[]`.
- `getVariantErrors(error)` narrows `INVALID_VARIANT` to `{ productId; color; size; code }[]`.
- `getValidationErrors(error)` narrows `VALIDATION_ERROR` entries and converts each `{ field, constraints }` entry into field messages. Nested fields retain dotted names such as `contact.email`.

The narrowers validate unknown input before returning it. Feature code must not cast `ApiError.errors` directly or parse the human-readable message.

### Guest-cart response handling

For every cart response processed by a Server Action or Route Handler, apply the **capture-whenever-present** rule: inspect for `sessionToken`, call `setCartSession` when present, remove the token field from the client-facing value, and only then return the typed cart. Do not assume it can only appear on the documented first `POST /cart/items`. The transport type may contain `sessionToken`; the shared client-facing `Cart` type must not.

Also mirror the backend's sliding expiry after every successful anonymous cart-aware mutation: when the response omits `sessionToken` but the request used an existing `sg_cart_session`, call `setCartSession` again with that stored token to issue a fresh seven-day `maxAge`. A response token always wins; if neither a returned nor stored token exists, do nothing. Do not refresh after a failed call, a signed-in mutation, or a pure Server Component read. The three deletion events below take precedence, so successful merge, guest checkout, and anonymous clear delete rather than refresh the cookie.

`lib/cart-session.ts` owns `getCartSession`, `setCartSession`, and `clearCartSession`. The `sg_cart_session` cookie is `httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, and `maxAge: 7 days`. Cookie writes are legal only in Server Actions and Route Handlers, never Server Components. Delete `sg_cart_session` on exactly three events: successful merge from post-sign-in `GET /cart`, successful guest checkout through `POST /orders/guest`, and successful anonymous `DELETE /cart`. The token must never enter URLs, logs, analytics, action return values, or client-side JavaScript.

## 2. Server Action result styles

Form mutations for addresses, reviews, and checkout live in `features/<name>/actions/`, one action per file. They return the existing `ActionState` type from `components/shared/form/utils/to-action-state.ts`:

```ts
type ActionState = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: Record<string, string | string[]>;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  response?: Record<string, string | number | undefined | null>;
};
```

The canonical action is:

```ts
"use server";

export async function updateProfileAction(
  _previousState: ActionState,
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

- Zod schemas are strict request whitelists because unknown body fields return `422 VALIDATION_ERROR`. Never spread API response objects or raw form objects into request bodies.
- `Object.fromEntries(formData)` is acceptable only for single-value inputs. For repeated values such as sizes, colors, or multi-select IDs, construct the input with `formData.getAll(name)` so values are not collapsed.
- `fromErrorToActionState` preserves submitted values in `payload`, maps validation entries to `fieldErrors`, records API code/status in `response`, and always returns a fresh `timestamp` for feedback effects. During Phase 0, adapt the copied helper from its admin-shaped `{ field, message }` assumption to the storefront contract's `{ field, constraints }` entries by flattening validated constraint values into field messages.
- Expected failures return `ActionState`; actions do not throw. Only Next control flow such as `redirect()` or `notFound()` may escape, and redirect calls must not be swallowed by the action's error conversion.

Client forms wire `useActionState` and render the shared `Form`, `FormControl`, and `SubmitButton`. `Form` observes the timestamp and emits success/error sonner feedback. `FormControl` composes the label/control with `FieldError`; `SubmitButton` uses `useFormStatus()` to disable itself and show pending state.

For a successful mutation that navigates, set `setCookieByKey("toast", message)` and call `redirect()`. The mounted `RedirectToast` reads and deletes that flash cookie after navigation. Do not rely on a toast from UI that is about to unmount.

Interactive cart and wishlist actions are the deliberate second style: a `useMutation` Server Action does not return `ActionState`. It returns the authoritative typed payload or a serializable error because the caller must update TanStack Query directly, and it never throws an expected API failure.

```ts
type InteractiveActionError = {
  error: { code: string; message: string; errors?: unknown };
};

type CartActionResult = Cart | InteractiveActionError;
```

The mutation `onSuccess` must first branch on `"error" in result`; only a returned `Cart` is written with `queryClient.setQueryData(cartKeys.current, result)`. Wishlist actions use the equivalent typed result with their documented optimistic update and rollback.

## 3. TanStack Query

TanStack Query v5 exists for interactive client state only. If a Server Component can render it, TanStack Query must not own it.

| Setting | Value | Reason |
|---|---|---|
| Query `retry` | Never for a 4xx `ApiError`; at most 2 for network/5xx failures | A 4xx response is a contract result, not transient failure |
| Mutation `retry` | `0` | Prevent duplicate writes and throttle pressure |
| Cart `staleTime` | `30_000` ms | Keeps drawer and badge coherent without excessive refetching |
| Cart `refetchOnWindowFocus` | `true` | Reconciles interactive state when the customer returns |

Use stable query-key factories:

```ts
export const cartKeys = {
  all: ["cart"] as const,
  current: ["cart", "current"] as const,
};

export const wishlistKeys = {
  all: (userId: string) => ["wishlist", userId] as const,
  current: (userId: string) => ["wishlist", userId, "current"] as const,
};
```

Wishlist keys are userId-scoped (unlike cart) because wishlist has no session-cookie identity resolution and two accounts can sign in on one browser.

The root layout reads the cart server-side and passes it to the client cart boundary as `initialData`. `useCart()` refetches only through the same-origin `app/api/cart/route.ts`. Wishlist refetches only through `app/api/wishlist/route.ts`. These are the only Route Handlers for interactive refetch; page data never flows through them.

Cache-update rules:

- Cart mutations return the complete cart. On success, call `queryClient.setQueryData(cartKeys.current, cart)`; never invalidate and refetch the cart.
- `syncCartAction` performs post-sign-in `GET /cart` with both identity headers, clears `sg_cart_session` only after success, and returns the merged cart for `setQueryData`.
- Wishlist toggles are optimistic: cancel the current query, snapshot it, apply the toggle, restore the snapshot on error, and reconcile with the server result on success.
- Coupon preview belongs to interactive state but never mutates cart totals locally; render only the server response from `POST /coupons/validate`.
- Checkout success replaces `cartKeys.current` with the canonical empty-cart shape and the checkout action calls `revalidatePath("/account/orders")`. Do not derive the empty state by subtracting lines.

Do not put catalog lists, product detail, categories, public review pages, addresses, or orders in the query cache. Those reads belong in Server Components, with URL navigation or `router.refresh()` when a fresh render is required. The one documented exception: `features/orders/components/orders-results-boundary.tsx` retains the last successfully rendered order-list subtree in local Client Component state so a failed manual Refresh (`docs/phase-6-orders.md` §6.1) does not blank out a page the customer already sees. This is UI-resilience state only — it holds no independently fetched or revalidated data, and every render still originates from a fresh Server Component read; it never substitutes for the URL-driven RSC fetch or introduces a second source of truth.

## 4. Money, dates, and IDs

- **Money:** values are decimal strings with variable scale, including `"2400"`, `"2040.5"`, and `"65.00"`. Display them only through `formatEGP()` in `lib/format.ts`. Perform zero client-side arithmetic: prices, discounts, shipping fees, cart totals, and order totals always come from the server response being shown.
- **Dates:** values are ISO 8601 UTC strings. Central formatting helpers choose the storefront's display locale and timezone; feature components do not hand-roll date parsing.
- **IDs:** treat every ID and token as opaque. Product/order records use cuid strings, Clerk users use Clerk IDs, guest cart tokens are UUIDs, and claim tokens are 64-character hex strings. Display only `humanOrderId` to customers; use record IDs in route segments and backend calls.

Never validate an opaque identifier by guessed shape unless the request contract explicitly requires it. Never expose the guest cart UUID; the order claim token is carried only by its documented tracking/claim flow.

## 5. Auth modes in practice

| Backend mode | Server request | Web handling |
|---|---|---|
| Public | Pass `auth: "public"` (or omit it); caching is allowed only with `cartSession: false` | Render for everyone. A Public failure never triggers an auth redirect. |
| Optional | Pass `auth: "optional"`; `apiFetch` fetches a fresh token when signed in and omits it for guests; add `cartSession: true` when cart-aware | Keep the route public. Optional controls use inline `<RequireAuth>` only when the chosen action requires sign-in. |
| Auth | Pass `auth: "required"`; `apiFetch` requires and attaches a fresh Clerk token; always `no-store` | `/account(.*)` is gated by `proxy.ts`; embedded Auth actions on public pages use inline `<RequireAuth>`. Backend 401/403 remains authoritative. |

The root `proxy.ts` uses `clerkMiddleware` to redirect signed-out visitors only for `/account(.*)`. All catalog, cart, checkout, and guest-order tracking routes are public. Sign-in and sign-up use catch-all pages inside the `(auth)` route group. The storefront defines no roles.

`redirectOnAuthError` is mode-aware: it may handle `UNAUTHENTICATED` only for Auth-mode calls. It must not redirect from Public or Optional paths. The copied admin helper currently applies the redirect unconditionally and must be corrected in Phase 0 before storefront actions use it.

`ACCOUNT_DISABLED` is different from ordinary anonymous behavior. If a supplied Clerk token resolves to a disabled account, sign out and show the dedicated disabled-account screen, including when the originating endpoint was Optional.

## 6. URL state with nuqs

Filters, sorting, and pagination live in the URL. Each feature defines its parameter schema in `features/<name>/hooks/`, split across two files by client/server boundary — a plain `<name>-search-params.ts` module (no directive) exporting the parsers, `createSearchParamsCache`, and the parsed type, and a `"use client"` `use-<name>-params.ts` module that imports those parsers and wraps `useQueryStates` in a `use<Name>Params()` hook. Do not put both in one `"use client"` file: Next.js still lets a Server Component import plain values from a client-directive module at the type level, but calling a server-only export (the cache's `.parse()`, or a mapper function) from such a module throws at runtime, since the whole file compiles as a client reference once it carries the directive. Server Components (`page.tsx`, RSC result components) import the cache/mapper/type from the plain module; Client Components import the hook from the `"use client"` module (they may re-export the type from either, since type-only exports are erased and carry no runtime boundary).

- Client updates use `shallow: false` so the Server Component tree receives the new URL state.
- **Addressable panel and step state also belongs in the URL**, not only filters, sorting and
  pagination: checkout's wizard `step` and the addresses screen's `address` param (`"new"` or an
  address id, `features/addresses/hooks/addresses-search-params.ts`) are both nuqs params. The test is
  whether the state is worth a shareable, refresh-surviving address. Ephemeral disclosure — menus,
  dropdowns, drawers, a confirm dialog — stays in the nearest Client Component. Resolve an unknown or
  foreign id to the closed state; never `notFound()` on it.
- Parameter names and formats match the backend wire contract exactly. Do not rename API fields for the URL.
- CSV parameters such as sizes and colors remain CSV strings and pass through verbatim; do not silently convert them into a different URL shape.
- Apply defaults and validation in the shared parser definition so server and client cannot drift.
- Next.js 16 page `params` and `searchParams` are Promises; await them before reading or passing values to the server cache.

Do not use component state as the source of truth for filters or pagination.

## 7. UI conventions

- shadcn components use the `base-lyra` style on `@base-ui/react`. Inspect the generated primitive before composing it; its parts and event APIs are not Radix APIs.
- Tailwind v4 is CSS-first. Define design values in `@theme` within `app/globals.css`; do not add `tailwind.config.*` or scatter raw brand colors across features.
- Prefer `components/shared/` before adding a feature-local duplicate: the form system, `FormControl`, `SubmitButton`, `FieldError`, `EmptyState`, `Spinner`, `RedirectToast`, and semantic badges already establish application behavior.
- Import Lucide icons with the `Lucide` prefix: `import { LucideShoppingBag, LucideX } from "lucide-react"`. Never alias or import them as `ShoppingBag` or `X`.
- Badge styling uses semantic variants only: `success`, `warning`, `info`, `destructive`, `secondary`, or `outline`. Do not apply literal color utility classes to badges.
- Component prop types are named `<ComponentName>Props`, files are kebab-case, and each feature's default export is a named `<Name>Feature` Server Component.
- Keep `app/` pages thin. Components, actions, queries, schemas, hooks, and types belong to their feature; `components/ui/` contains shadcn primitives only.
- Image radius follows the Classical scale: controls, cards, inputs and dialogs take the Classical radius scale; photographs are square inside a `.plate` mat; `rounded-full` only for colour swatches and the radio dot.
- **Accent text contrast:** `text-accent` (`#b68235`, 3.02:1 on `--background`) is reserved for 1px strokes, icons, and type at 24px or larger. Any accent-coloured text below 24px uses `text-accent-strong` (`#7d5411`, ~6.6:1) instead.
- **Tabular figures:** numerals in figure positions — order IDs, dates, counts, quantities, pagination, phone numbers — carry tabular figures via the `.figures` utility or the `<Money>` component (`components/shared/money`). Running prose must not: Lora's tabular feature widens word-spacing and punctuation, which visibly loosens body text.
- **`--font-sans` is a compatibility alias, not a real sans-serif:** it resolves to the serif `Lora` (`--font-body`), kept only so `html { @apply font-sans }`, `.text-eyebrow`, and Clerk's theme keep resolving without a codebase-wide sweep. New code should reference `--font-body` / `--font-heading` by name, not `--font-sans`.
- **Classical tokens live in `@theme`/`:root` in `app/globals.css` only.** Never restate a token's literal value (hex colour, shadow, radius, type size) in feature code — reference the token or its Tailwind utility.

## 8. Testing baseline (applies to every phase)

There is no automated application test suite in the initial plan. Every phase must pass:

```bash
bun lint
bunx tsc --noEmit
```

Each phase also carries a browser Definition of Done checklist. Exercise at least a hard refresh, a signed-out private session, and a second browser session where identity isolation matters. Cart-session checks must cover token capture, sign-in merge, guest checkout cleanup, anonymous clear cleanup, and confirmation that identity tokens never enter browser-visible payloads.

Pure helpers such as `format.ts` and the structured-error narrowers may gain focused `bun test` coverage later. Until then, lint, type-checking, and the per-phase browser checklist are the required gates.
