This file provides guidance to Codex when working in this repository.

This repo is the **SG Couture admin dashboard**: a standalone Next.js 16
frontend that consumes a separate backend REST API.

It has **no database and no backend of its own**: no Prisma, no Stripe/Resend,
and no Cloudinary server SDK. The API contract lives in
`docs/integration/admin/` (vendored from the backend repo, read-only). Start at
`docs/README.md` for the doc map. Never invent endpoints or fields not
documented there.

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
bunx shadcn@latest add <item>  # install a shadcn primitive
```

## Implementation Status

`docs/phases/README.md` is the status tracker — keep its table current.
Phases 1–7 are done: all features, `lib/api/`, `proxy.ts`, and the shared
primitives exist. Phase 8 (hardening/QA) is in progress. Deferred backend
endpoints (`verify-payment`, notifications broadcast) 404 — do not build
against them.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all
differ from training data. Read the relevant guide in `node_modules/next/dist/docs/`
before writing any Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architecture

- **Reads**: Server Components call `apiFetch` in `lib/api/` server-side, using a
  fresh Clerk session token per request as `Authorization: Bearer`. Do not use
  client-side data fetching for page data.
- **Mutations**: Server Actions return `ActionState`. Zod parse, call
  `apiFetch`, then `revalidatePath` and `toActionState`. Convert errors with
  `fromErrorToActionState`. Never throw from an action except for `redirect` or
  `notFound`.
- **URL state**: Use nuqs. One params schema per feature
  (`hooks/use-<feature>-params.ts`) drives both `createSearchParamsCache` and
  `useQueryStates` with `shallow: false`. Param names must match the API
  contract. Never use `useState` for filters or pagination.
- **Security**: Backend 401/403 responses are the real gate. `proxy.ts`
  middleware and role-filtered nav are UX only. Clerk tokens must never reach
  the client.

Full data-flow spec: `docs/conventions/01-data-flow.md`.

## Project Layout

No `src/` directory. `@/*` maps to the repo root.

```text
app/                 # thin pages/layouts only; zero logic
features/<name>/     # components/ hooks/ actions/ queries/ schema/ types/ index.tsx
                     # index.tsx exports default <Name>Feature (Server Component)
lib/                 # utils.ts (cn), env.ts, api/, format.ts
components/ui/       # shadcn primitives only (base-nova on @base-ui/react)
components/shared/   # form system, form-control, submit-button, confirm-dialog,
                     # empty-state, spinner, redirect-toast; prefer these
actions/             # cross-cutting Server Actions, e.g. cookies.actions.ts
```

Use one file per Server Action. `queries/` should be thin `cache()`-wrapped
`apiFetch` calls with no business logic; the backend owns business rules.

## Server Actions And Forms

Follow this pattern:

```ts
export async function myAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = mySchema.parse(Object.fromEntries(formData));
    await apiFetch("/admin/...", { method: "POST", body: input });
    revalidatePath("/...");
    return toActionState("SUCCESS", "Done");
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
}
```

Schemas are whitelists because the API rejects unknown fields. For multi-value
fields such as sizes, colors, and subCategoryIds, use `formData.getAll(...)`
because `Object.fromEntries(formData)` collapses repeated keys.

Forms should wire `useActionState`, render the shared `Form`, `FormControl`, and
`SubmitButton`; `Form` auto-toasts via sonner. Redirect flows use
`setCookieByKey("toast", ...)` plus `redirect()`, with `RedirectToast` displaying
the flash toast. Details: `docs/conventions/02-forms.md`.

## Auth And Roles

- Clerk session JWT is the API Bearer token, fetched fresh per request via
  `auth()` -> `getToken()`, server-side only.
- Roles are `USER | MANAGER | ADMIN` in Clerk `publicMetadata.role`.
- ADMIN-only routes: `/`, `/analytics`, `/staff-users`.
- Everything else is MANAGER+.
- MANAGER users land on `/orders`.
- USER has no access.

## API Conventions

Full table: `docs/integration/admin/00-conventions.md`.

- Success envelope: `{ status: "success", message, data, meta? }`.
- Error envelope: `{ status: "error", message, code, errors? }`.
- Branch on `code`, never on `message`.
- DELETE success returns 204 with an empty body.
- Money and record decimals are strings, e.g. `"1299.00"` in EGP. Do not use
  float math; format with `formatEGP()`.
- Dashboard and analytics values return plain numbers.
- Request bodies are strict; unknown fields return 422.
- Never send server-owned fields such as `slug`, `priceAfterDiscount`, `sold`,
  ratings, order totals, or `usedCount`.
- Pagination uses `page`/`limit` in and
  `meta { page, limit, totalItems, totalPages, hasNext, hasPrev }` out. Always
  keep pagination server-side.

## UI

- shadcn style is **base-nova on `@base-ui/react`**, not Radix. Check generated
  component anatomy before assuming Radix patterns.
- Tailwind v4 is CSS-first. Theme lives in `app/globals.css` via `@theme`; there
  is no `tailwind.config.*`.
- Tables are server-rendered shadcn `table` plus nuqs. Do not use TanStack table
  or bulk actions; the API has no bulk endpoints.
- Destructive actions must go behind `ConfirmDialog`.
- Charts use Recharts and colors from `--chart-*` CSS variables. Charts belong
  only on dashboard/analytics.

## Naming And Style

- Component prop types are prefixed with the component name:
  `OrdersTableProps`, never `Props`.
- Lucide icons use the `Lucide` prefix: `LucideSearch`, never `Search`.
- Files are kebab-case.
- Feature default exports are named `<Name>Feature`.
- API response types are hand-written from the contract docs.

## Zod v4

- `z.enum()` accepts enum-like objects; `z.nativeEnum()` is deprecated.
- Use the singular `.enum` accessor.
- `error.flatten()` is deprecated. Prefer `z.flattenError(error)` in new code.
- Use top-level formats such as `z.url()` and `z.email()`, not
  `z.string().url()` or `z.string().email()`.

## Environment

Only these environment variables are expected:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `API_URL`

`API_URL` is server-only and must not use `NEXT_PUBLIC_`. Access env vars through
the validated `lib/env.ts` singleton, never `process.env` directly. See
`docs/architecture/05-environment.md`.
