# Phase 3 — Auth (Clerk), Cart Merge, Profile

**Objective:** complete guest-first Clerk authentication for the storefront, attach fresh Bearer tokens only inside the server BFF, merge an anonymous cart into the signed-in cart exactly once, clear user-scoped browser cache on sign-out, handle disabled accounts globally, and ship the server-rendered profile page and edit form.

**Prerequisites:** Phase 2 Definition of Done; a guest cart can be created before authentication, and a second browser can prepare an existing user cart for overlap testing.

**API surface:** Auth-mode plumbing from `00-conventions.md`; `GET /users/me` and `PATCH /users/me`; the merge is triggered by authenticated `GET /cart`. There is no merge endpoint.

## Tasks

### 3.1 Clerk routes, Header states, and protection

- [ ] Complete Clerk setup with `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx`, plus a centered shared auth layout. Use Clerk’s Next.js components with the shadcn-aligned appearance; keep both routes public in `proxy.ts`.
- [ ] Replace the temporary Header controls with explicit `SignedOut` sign-in/sign-up links and `SignedIn` `UserButton` state. Preserve the intended return URL so a visitor sent from `/account(.*)` lands on the original account page after authentication.
- [ ] Keep `proxy.ts` public-first and protect only `/account(.*)` with `await auth.protect()`. Do not introduce roles; backend 401/403 responses remain the security gate for RSC queries, Route Handlers, and Server Actions.
- [ ] Add a reusable `<RequireAuth>` prompt for optional actions available on public pages. It opens or links to sign-in with a return URL and never hard-redirects catalog browsing; protected `/account(.*)` routes continue to use `proxy.ts`.
- [ ] Verify every Optional/Auth backend request obtains a fresh token server-side through `await auth()` and `getToken()`. No Client Component, Action result, same-origin handler payload, log, or TanStack entry may receive the Clerk JWT.

### 3.2 Cart merge — critical sequence

- [ ] Add `syncCartAction` as a Server Action returning a sanitized `CartActionResult`. Require an active Clerk session, read `sg_cart_session`, and call `GET /cart` with both `Authorization: Bearer <fresh token>` and `X-Cart-Session` when the guest cookie exists; that overlap triggers the documented server-side merge.
- [ ] After a successful authenticated `GET /cart`, call `clearCartSession()` when a guest cookie was present, then return only the merged cart. Never clear the cookie before success, on an error, or through a separate merge route.
- [ ] Add a narrow client session bridge under the providers. When Clerk reports an active session, call `syncCartAction`, then `queryClient.setQueryData(cartKeys.current, mergedCart)`; do not invalidate the cart or refetch it after success.
- [ ] Guard activation by Clerk session ID with a ref so React re-renders cannot double-fire the merge. Reset the guard only after a failed attempt that the user may safely retry; server merge replay safety is a fallback, not the primary control.
- [ ] If there is no guest cookie, the same action still loads the current user cart with Bearer only and seeds `cartKeys.current`. Preserve an adopted cart exactly as returned even if its totals remain stale until the next mutation.
- [ ] Document beside `syncCartAction` that registered checkout depends on this invariant: the authenticated `GET /cart` completes before any registered checkout UI can proceed, so checkout never works from an unmerged guest view.

### 3.3 Sign-out hygiene

- [ ] Centralize signed-in → signed-out transition handling around Clerk’s session state, including sign-out initiated from `UserButton`. After Clerk sign-out completes, call `queryClient.clear()` so cart, future wishlist data, and any other user-scoped interactive cache entries are removed.
- [ ] Immediately load guest cart state through same-origin `/api/cart` after the clear and seed `cartKeys.current`. Because a successfully merged guest cookie was deleted, the expected state is the documented virtual empty cart.
- [ ] Verify sign-out does not call `clearCartSession()` and does not reveal prior profile/cart data during the transition; catalog pages remain publicly navigable.

### 3.4 Disabled-account handling

- [ ] Build one shared disabled-account state and central handler keyed strictly to `403 ACCOUNT_DISABLED`. It must cover RSC Auth reads, same-origin refetch errors, and serializable Server Action errors, then sign out through Clerk, clear the QueryClient, and render support guidance.
- [ ] Keep `403 FORBIDDEN` as a distinct no-access result and `401 UNAUTHENTICATED` as a re-authentication result. Never branch on the backend message and never apply the Phase 0 Auth redirect helper to Public/Optional failures.
- [ ] Prevent redirect or sign-out loops while the disabled-account state is active, and verify no protected content flashes before the state replaces it.

### 3.5 Profile feature

- [ ] Create profile response/update types from `11-profile.md` and `features/profile/queries/get-profile.ts` as a thin, uncached Auth `GET /users/me` call. `/account` remains a thin RSC page rendering `ProfileFeature`; it does not use TanStack Query for page data.
- [ ] Fetch the current Clerk user server-side alongside the backend profile. Display composed backend `name`, `email`, `phone`, and member-since, but initialize edit `firstName` and `lastName` from Clerk’s explicit fields rather than splitting `name`.
- [ ] Create a Zod v4 whitelist for only `firstName`, `lastName`, and `phone`. Enforce the atomic name pair: omit both for phone-only changes, submit both for any name change, reject blanks, and never send a legacy `name` field.
- [ ] Implement `update-profile-action.ts` with `useActionState` and the copied `Form`, `FormControl`, and `SubmitButton`: parse, call Auth `PATCH /users/me`, `revalidatePath("/account")`, and return `toActionState`/`fromErrorToActionState` without throwing API failures.
- [ ] Map `409 DUPLICATE_RESOURCE` to the phone control, and map `422 VALIDATION_ERROR.errors[]` by field path. Preserve entered values in `ActionState` and keep name-pair failures attached to both relevant controls where useful.
- [ ] On success, show the shared form toast, refresh the RSC account view, and reload Clerk’s client user object so Header/UserButton name presentation matches the backend-initiated Clerk update.

## Error handling matrix

| Code | Where | Web behavior |
|---|---|---|
| `UNAUTHENTICATED` | Auth query/action | preserve return URL, prompt sign-in, then retry explicitly |
| `ACCOUNT_DISABLED` | any resolved signed-in request | one global Clerk sign-out + cache clear + disabled-account state |
| `FORBIDDEN` | Auth operation | no-access feedback; never present it as disabled or signed out |
| `DUPLICATE_RESOURCE` | profile phone | field-level “phone already in use” feedback |
| `VALIDATION_ERROR` | profile | map documented `errors[]` paths to form controls |

## Definition of Done

- Build a guest cart while signed out, sign up, and confirm the merged signed-in cart contains every line; hard refresh still shows the user cart and `sg_cart_session` is gone.
- With a second browser signed into the same existing account, prepare an account cart; in the first browser prepare a guest cart with one equal `(productId, color, size)` line and one distinct line, then sign in. Equal quantities are summed and capped at stock, and the distinct line is appended.
- The merge activation bridge does not double-fire, sends both identity headers only through the server, and writes the returned complete cart directly to `cartKeys.current`.
- Sign-out clears the entire QueryClient, refetches a guest virtual empty cart, leaves no user profile/wishlist/cart data in browser cache, and keeps catalog browsing available.
- `/account` protection preserves the return URL; optional public features use the inline `<RequireAuth>` prompt rather than forcing navigation.
- Profile name-pair, phone-only, duplicate-phone, validation-field, and single-name-field rejection paths match the matrix and refresh both backend RSC data and Clerk presentation.
- A disabled account is verified end to end: it signs out once, clears interactive cache, renders the disabled state, and never becomes a generic forbidden message.
- `bun lint` and `bunx tsc --noEmit` are green; no request or browser artifact logs or caches a Clerk JWT or cart token.

## Out of scope

Wishlist, addresses, order history/detail, reviews management, checkout, and order tracking. Their optional entry points may use `<RequireAuth>`, but their screens ship in later phases.
