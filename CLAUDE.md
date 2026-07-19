# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repo is the **SG Couture admin dashboard** — a standalone Next.js 16 frontend that consumes a separate backend REST API. It has **no database and no backend of its own**: no Prisma, no Stripe/Resend, no Cloudinary server SDK. The API contract lives in `docs/integration/admin/` (vendored from the backend repo, read-only) — **never invent endpoints or fields not documented there**. Start at `docs/README.md` for the doc map.

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
bun run build                  # production build (also type-checks)
bun lint                       # ESLint
bunx tsc --noEmit               # type-check only, no build
bunx shadcn@latest add <item>  # install a shadcn primitive
```

No automated test suite is configured (no Jest/Vitest, no `*.test.*` files) — rely on `bun lint`, `bunx tsc --noEmit`, and manual verification in the browser.

## Git

- Commit messages must **not** include a `Co-Authored-By` trailer or any Claude Code / AI-attribution line.

## Implementation status

Phases 1–7 are **done** — all features (`categories`, `products`, `orders`, `coupons`, `shipping-zones`, `customers`, `staff-users`, `dashboard`, `analytics`), `lib/api/`, `proxy.ts`, and the shared primitives exist. Phase 8 (hardening/QA) is in progress. `docs/phases/README.md` is the status tracker — keep its table current when starting/finishing a phase.

**Deferred (backend hasn't shipped these — they 404, do not build against them):** `POST /admin/orders/:id/verify-payment` (card payments; all orders are CASH) and `POST /admin/notifications/broadcast`.

## Architecture

- **Reads**: Server Components → `apiFetch` in `lib/api/` (server-only; fresh Clerk session token per request → `Authorization: Bearer`). No client-side data fetching for page data.
- **Mutations**: Server Actions returning `ActionState` — Zod parse → `apiFetch` → `revalidatePath` + `toActionState`, errors via `fromErrorToActionState`. Never throw out of an action (except `redirect`/`notFound`).
- **URL state**: nuqs — one params schema per feature (`hooks/use-<feature>-params.ts`) driving both `createSearchParamsCache` and `useQueryStates` (`shallow: false`). Param names match the API contract. Never `useState` for filters/pagination.
- **Security**: the backend's 401/403 is the real gate; `proxy.ts` middleware and role-filtered nav are UX. The Clerk token never reaches the client.
- **Uploads**: no Cloudinary SDK — the shared `ImageUploader` gets a signature from the backend (`getUploadSignature` action → `POST /admin/uploads/signature`) and the browser uploads straight to Cloudinary. Gallery reorder uses dnd-kit. See `docs/conventions/05-media.md`.
- **`apiFetch`** (`lib/api/http.ts`): prefixes `${API_URL}/api/v1`, always `cache: "no-store"`, unwraps the envelope, throws `ApiError(status, code, message, errors)` on failure; 204 → `data: undefined`. Auth redirects via `redirectOnAuthError` in non-`ActionState` contexts.

Full spec: `docs/conventions/01-data-flow.md`.

## Project layout

No `src/` — `@/*` maps to the repo root.

```
app/                 # thin pages/layouts only — zero logic
features/<name>/     # components/ hooks/ actions/ queries/ schema/ types/ index.tsx
                     # index.tsx exports default <Name>Feature (Server Component)
lib/                 # utils.ts (cn), env.ts, api/, format.ts, pagination.ts
components/ui/       # shadcn primitives only (base-nova on @base-ui/react)
components/shared/   # form system, form-control, submit-button, confirm-dialog,
                     # empty-state, spinner, redirect-toast, image-uploader,
                     # tag-input, chart-data-table, app-shell — prefer these
actions/             # cross-cutting Server Actions (cookies.actions.ts: "toast" flash cookie)
```

One file per Server Action; `queries/` are thin `cache()`-wrapped `apiFetch` calls (no business logic — the backend owns it).

## Server Action pattern

```ts
export async function myAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const input = mySchema.parse(Object.fromEntries(formData)); // schema = whitelist (API rejects unknown fields)
    // multi-value fields (sizes, colors, subCategoryIds): use formData.getAll(...) — fromEntries collapses them
    await apiFetch("/admin/…", { method: "POST", body: input });
    revalidatePath("/…");
    return toActionState("SUCCESS", "Done");
  } catch (e) {
    return fromErrorToActionState(e, formData); // Zod + ApiError(422→fieldErrors) + Clerk errors
  }
}
```

Forms: caller wires `useActionState`, renders the shared `Form` + `FormControl` + `SubmitButton`; `Form` auto-toasts via sonner. Redirect flows: `setCookieByKey("toast", …)` + `redirect()` (RedirectToast shows it). Details: `docs/conventions/02-forms.md`.

## Auth & roles

- Clerk session JWT = the API Bearer token, fetched fresh per request via `auth()` → `getToken()`, server-side only.
- Roles `USER | MANAGER | ADMIN` in Clerk `publicMetadata.role`. **ADMIN-only: `/` (dashboard), `/analytics`, `/staff-users`** — everything else MANAGER+. MANAGERs land on `/orders`. `USER` has no access.

## API conventions (crib — full table in docs/integration/admin/00-conventions.md)

- Envelope: `{ status: "success", message, data, meta? }`; errors `{ status: "error", message, code, errors? }`. **Branch on `code`, never `message`.** DELETE success = 204 empty body.
- Money/record decimals are **strings** (`"1299.00"`, EGP) — no float math; format with `formatEGP()`. Dashboard/analytics return plain **numbers**.
- Bodies are strict: unknown fields → 422. **Never send server-owned fields**: `slug`, `priceAfterDiscount`, `sold`, ratings, order totals, `usedCount`.
- Pagination: `page`/`limit` in, `meta { page, limit, totalItems, totalPages, hasNext, hasPrev }` out — always server-side.

## UI

- shadcn style **base-nova on `@base-ui/react` — NOT Radix**: check the generated file's anatomy, don't assume Radix docs.
- Tailwind v4 CSS-first: theme in `app/globals.css` (`@theme`); **no `tailwind.config.*`**.
- Tables: server-rendered shadcn `table` + nuqs — no TanStack, no bulk actions (the API has none). Destructive actions behind `ConfirmDialog`.
- Charts (recharts): colors from `--chart-*` CSS vars; only on dashboard/analytics.
- **Status badges**: colour via the `Badge` **semantic variants** (`success`/`warning`/`info`/`destructive` + neutral `secondary`/`outline`) — never literal colour classes; humanize labels; reuse the shared `order-status-badge` / `payment-status-badge` / `active-badge`. Full design system: `docs/conventions/07-badges.md`.

## Naming & style

- Component props types prefixed with the component name: `OrdersTableProps`, never `Props`.
- Lucide icons with the `Lucide` prefix: `LucideSearch`, never `Search`.
- Files kebab-case; feature default export `<Name>Feature`; API response types hand-written from the contract docs.

## Zod v4

- `z.enum()` accepts enum-like objects; `z.nativeEnum()` is deprecated. `.enum` accessor (singular).
- `error.flatten()` is deprecated (existing code still uses it) — prefer `z.flattenError(error)` in new code.
- Top-level formats: `z.url()`, `z.email()` — not `z.string().url()`.

## Environment

Three vars only: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `API_URL` (server-only, no `NEXT_PUBLIC_`). Access via the validated `lib/env.ts` singleton, never `process.env` directly. See `docs/architecture/05-environment.md`.
