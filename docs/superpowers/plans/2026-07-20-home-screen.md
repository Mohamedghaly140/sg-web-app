# Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/` as a server-rendered Home screen (Hero, Shop by Category, Featured, New Arrivals) per `docs/screens/home.md` and `docs/phase-1-catalog.md` §1.5, built around a generic `ProductSection` Server Component that drives both product rails from props, plus the shared Navbar/Footer shell every route will render inside.

**Architecture:** Thin `app/page.tsx` over a `HomeFeature` Server Component (`features/home/index.tsx`) that composes four independent sections. Category and product data are Public reads through the server-only `apiFetch`, cached via `next: { revalidate, tags }`. Each dynamic section (Category, Featured, New Arrivals) gets its own `<Suspense>` fallback and its own `unstable_catchError` error boundary so one failing rail never take down the page. `Navbar`/`Footer` are static Server Components rendered from `app/layout.tsx`; wishlist, cart, and sign-in controls are inert visual placeholders (their real data/auth wiring is Phase 2/3/4, not this plan).

**Tech Stack:** Next.js 16 App Router (Server Components, `unstable_catchError`), TypeScript, Tailwind v4, shadcn `base-lyra` on `@base-ui/react`, Bun.

## Context

Nothing for this screen exists yet: no `features/` directory, no `components/ui/badge.tsx`, and `lib/api/http.ts` currently 401s every request without a Clerk session (unusable for a guest-facing Home page). A sibling plan, `docs/superpowers/plans/2026-07-19-product-detail.md`, already designed fixes for these same blockers (Badge primitive, mode-aware `apiFetch`, `ProductSummary`/`ProductCategoryRef` types, `RatingSummary`/`StockBadge`/`ProductCard`) but was never executed — confirmed via `git show --stat` on the commit that references it, which added only the 1423-line markdown file, no code. This plan lands that same code (verbatim, already reviewed) as its own prerequisite tasks, so the product-detail plan's Task 1/2 and parts of Task 3/4 become pre-done when it eventually runs (Task 4 below adds a status note to that file making this discoverable).

This plan also builds the shared Navbar/Footer shell (`docs/screens/shared-shell.md`), which is normally Phase 0 §0.5 scope — folded in here at the user's request rather than deferred. It deliberately does **not** wire live Clerk auth (`ClerkProvider`, `proxy.ts`, `clerkMiddleware`) — that is Phase 0 §0.4 / Phase 3 territory. The sign-in control renders as a disabled placeholder, identical in spirit to the wishlist/cart icons, which are already documented as "visual placeholder only" in this phase. `docs/phase-0-foundation.md` §0.4/§0.5 checkboxes are **not** ticked by this plan for that reason — only §0.3 (apiFetch) is genuinely complete.

Home ships with working links to routes that don't exist yet (`/products`, `/categories`, `/categories/[slug]`, `/products/[slug]` all 404 until Phase 1 tasks 1.1–1.3 land). This is expected and temporary — those routes are contracted and imminent, unlike the Footer's dropped Customer Care links, which have no contract at all yet.

## Global Constraints

- Bun only — never `npm`/`npx`/`yarn`. Run `bunx tsc --noEmit` and `bun lint` after every task; both must be clean before committing.
- No automated test suite exists in this repo. Do not invent one. Each task's verification is `bunx tsc --noEmit` + `bun lint` + a stated manual/browser check; the final task carries the full browser Definition of Done.
- All backend calls go through the server-only `apiFetch` in `lib/api/http.ts`. Every query in this plan uses `auth: "public"` (no Clerk token, no `cartSession`) — Home has no interactive or identity-bearing reads.
- Money is a decimal string, formatted only via `formatEGP()`. Never do client-side money arithmetic. `ratingsAverage: null` renders "No reviews yet", never zero stars.
- Branch on `ApiError.code`, never `.message`.
- Badge styling uses only the semantic variants added in Task 1 (`success`, `warning`, `info`, `destructive`, `secondary`, `outline`) — never literal color classes.
- Lucide icons import with the `Lucide` prefix (`LucideStar`, never `Star`).
- Component prop types are named `<ComponentName>Props`; files are kebab-case; a feature's root `index.tsx` default-exports `<Name>Feature`. Other components use named exports.
- `app/` pages stay thin; all logic lives in `features/<name>/` or `components/shared/`.
- Public catalog reads (`GET /products`, `GET /categories`) may use `next: { revalidate, tags }`; never `cartSession: true`.
- Wishlist, cart badge, and sign-in/account state are **not** wired live in this plan — render as disabled/inert placeholders only, never a live Clerk or `useCart()` call. Do not create `proxy.ts`, `ClerkProvider`, or a `/sign-in` route.
- No hero photography asset exists in `public/`. Render a decorative gradient panel in its place rather than fabricating an image path that would 404.
- Footer's Customer Care column (About/Contact/Shipping & Returns) is omitted entirely — no phase doc covers those pages yet, and `docs/screens/shared-shell.md` says never link to a route that doesn't exist.

## Implementation Phases

This plan splits into 4 phases. Complete and verify each phase (`bunx tsc --noEmit && bun lint`, plus the phase's own check below) before starting the next. Phases 1 → 2 → 3 are strict dependencies (each builds on the prior phase's files). Phase 4 (shell) touches no file from Phase 2 or 3 and can be built in parallel with them by a separate implementer if desired — it only needs Phase 1 done first (it uses `Sheet`/`Button`).

| Phase | Tasks | Delivers | Depends on |
|---|---|---|---|
| 1 — Infrastructure prerequisites | 1–2 | `Badge`/`Skeleton`/`Sheet` primitives; mode-aware `apiFetch` | none |
| 2 — Data layer & shared components | 3–6 | Product/category types+queries; `RatingSummary`, `StockBadge`, `ProductCard`, `CategoryTile`, `SectionErrorBoundary` | Phase 1 |
| 3 — Home content sections | 7–10 | `ProductSection`, `CategorySection`, `Hero`, `HomeFeature`, `/` route | Phase 2 |
| 4 — Shared shell | 11–13 | `Navbar`, `Footer`, wired into root layout | Phase 1 only |

Verification per phase:
- **Phase 1:** `bunx tsc --noEmit` shows no errors from `components/shared/active-badge.tsx`; `bun lint` clean.
- **Phase 2:** `bunx tsc --noEmit && bun lint` clean — no browser check yet, nothing is routed.
- **Phase 3:** `bun dev`, visit `/`, confirm Hero + Shop by Category + Featured + New Arrivals all render with live data and independent loading/error states (Home's content Definition of Done, without shell chrome — no Navbar/Footer yet if Phase 4 hasn't landed).
- **Phase 4:** the full manual browser Definition of Done in Task 13 Step 3 (this is the plan's final acceptance check, since it exercises Navbar + Footer + all four Home sections together).

---

## Phase 1 — Infrastructure Prerequisites

Unblocks every later phase: nothing else in this plan compiles or can fetch data until this lands.

### Task 1: Add Badge, Skeleton, and Sheet primitives

**Files:**
- Create: `components/ui/badge.tsx` (via shadcn CLI, then edited)
- Create: `components/ui/skeleton.tsx` (via shadcn CLI)
- Create: `components/ui/sheet.tsx` (via shadcn CLI)
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `Badge` from `@/components/ui/badge` accepting `variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"` — consumed by `components/shared/active-badge.tsx` (already exists, currently broken) and every task from Task 4 onward.
- Produces: `Skeleton` from `@/components/ui/skeleton` — consumed by Task 7/8's loading fallbacks.
- Produces: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet` — consumed by Task 11's mobile menu.

- [ ] **Step 1: Add success/warning/info theme tokens to `app/globals.css`**

In the `@theme inline { ... }` block, immediately after the line `--color-destructive: var(--destructive);`, add:

```css
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
```

In `:root { ... }`, immediately after the line `--destructive: oklch(0.577 0.245 27.325);`, add:

```css
  --success: oklch(0.6 0.15 145);
  --warning: oklch(0.75 0.15 70);
  --info: oklch(0.6 0.15 240);
```

In `.dark { ... }`, immediately after the line `--destructive: oklch(0.704 0.191 22.216);`, add:

```css
  --success: oklch(0.72 0.17 145);
  --warning: oklch(0.82 0.17 70);
  --info: oklch(0.72 0.17 240);
```

- [ ] **Step 2: Generate the primitives**

Run: `bunx shadcn@latest add badge skeleton sheet`
Expected: creates `components/ui/badge.tsx` (a `badgeVariants` `cva(...)` call matching `components/ui/button.tsx`'s pattern), `components/ui/skeleton.tsx` (a `Skeleton` div with `animate-pulse`), and `components/ui/sheet.tsx` (`Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetClose` built on `@base-ui/react`'s dialog primitives per `components.json`'s `base-lyra` style).

- [ ] **Step 3: Add the three semantic Badge variants**

Open the generated `components/ui/badge.tsx`. Inside the `cva(...)` call's `variants: { variant: { ... } }` object, insert these three entries immediately after the existing `outline:` entry (matching the `bg-<color>/10 text-<color>` tint pattern `button.tsx`'s `destructive` variant already uses):

```ts
        success:
          "bg-success/10 text-success dark:bg-success/20",
        warning:
          "bg-warning/10 text-warning dark:bg-warning/20",
        info:
          "bg-info/10 text-info dark:bg-info/20",
```

If the generated file's variant keys or formatting differ from `button.tsx`'s pattern, match whatever style the generated `default`/`secondary`/`outline` entries already use.

- [ ] **Step 4: Note the generated Sheet API before Task 11**

Read the generated `components/ui/sheet.tsx` and record its exact exported component names and prop signatures (especially whether `SheetTrigger` takes a `render` prop like `Button` does, per the base-lyra polymorphism pattern, or wraps `children` directly). Task 11's code assumes `SheetTrigger`/`SheetContent`/`SheetHeader`/`SheetTitle` with a `render`-style trigger — adapt it to whatever the generated file actually exports.

- [ ] **Step 5: Verify `active-badge.tsx` now compiles**

Run: `bunx tsc --noEmit`
Expected: no errors from `components/shared/active-badge.tsx` (it already does `import { Badge } from "@/components/ui/badge"` and uses `variant={active ? "success" : "outline"}`).

- [ ] **Step 6: Lint**

Run: `bun lint`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add components/ui/badge.tsx components/ui/skeleton.tsx components/ui/sheet.tsx app/globals.css
git commit -m "feat: add Badge, Skeleton, and Sheet primitives"
```

---

### Task 2: Make `apiFetch` mode-aware

**Files:**
- Modify: `lib/api/http.ts` (full rewrite)
- Modify: `lib/api/api-error.ts`
- Modify: `docs/phase-0-foundation.md` (tick §0.3 checkboxes)
- Modify: `docs/README.md` (flip Phase 1 status)

**Interfaces:**
- Produces: `apiFetch<TData = undefined>(path: string, options?: ApiFetchOptions): Promise<TData>` — matching the `declare function apiFetch<T>(...): Promise<T>` signature documented identically in CLAUDE.md, AGENTS.md, `docs/00-architecture.md`, `docs/01-conventions.md`, `docs/phase-0-foundation.md`.
- Produces: `ApiAuthMode`, `ApiFetchOptions`, `PageMeta`, `PaginatedResult<TItem> = { items: TItem[]; meta: PageMeta }` — every later task's queries consume these.
- Produces: `ApiError(status: number, code: string, message: string, errors?: unknown)`.

- [ ] **Step 1: Rewrite `lib/api/http.ts`**

```ts
import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import { ApiError } from "./api-error";

export type ApiAuthMode = "public" | "optional" | "required";

export type PageMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedResult<TItem> = {
  items: TItem[];
  meta: PageMeta;
};

export type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: ApiAuthMode;
  cartSession?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
  headers?: HeadersInit;
};

type ApiEnvelope =
  | { status: "success"; message: string; data: unknown; meta?: PageMeta }
  | { status: "error"; message: string; code: string; errors?: unknown };

const CART_SESSION_COOKIE = "sg_cart_session";

export async function apiFetch<TData = undefined>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TData> {
  const {
    method,
    body,
    auth: authMode = "public",
    cartSession = false,
    cache,
    next,
    headers,
  } = options;

  const isPublicCacheable = authMode === "public" && !cartSession;

  if ((cache !== undefined || next !== undefined) && !isPublicCacheable) {
    throw new Error(
      `apiFetch: cache/next metadata is only allowed for public, non-cart-session requests (path: ${path})`,
    );
  }

  const requestHeaders = new Headers(headers);

  if (requestHeaders.has("Authorization") || requestHeaders.has("X-Cart-Session")) {
    throw new Error(
      "apiFetch: callers must not set Authorization or X-Cart-Session headers directly",
    );
  }

  if (authMode === "optional" || authMode === "required") {
    const { getToken } = await auth();
    const token = await getToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    } else if (authMode === "required") {
      throw new ApiError(401, "UNAUTHENTICATED", "No active session");
    }
  }

  if (cartSession) {
    const cookieStore = await cookies();
    const token = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (token) {
      requestHeaders.set("X-Cart-Session", token);
    }
  }

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  if (!isPublicCacheable) {
    requestInit.cache = "no-store";
  } else if (next) {
    requestInit.next = next;
    if (cache) {
      requestInit.cache = cache;
    }
  } else {
    requestInit.cache = cache ?? "no-store";
  }

  const res = await fetch(`${env.API_URL}/api/v1${path}`, requestInit);

  if (res.status === 204) {
    return undefined as TData;
  }

  let json: ApiEnvelope;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, "INTERNAL_ERROR", "Malformed response from backend");
  }

  if (json.status !== "success") {
    throw new ApiError(res.status, json.code, json.message, json.errors);
  }

  if (json.meta !== undefined) {
    return { items: json.data, meta: json.meta } as TData;
  }

  return json.data as TData;
}
```

Clerk's `auth()` is called only for `"optional"`/`"required"` — calling it unconditionally would opt every route (including Home's public catalog reads) into dynamic rendering and defeat `next: { revalidate }` caching. The cache-metadata assertion runs unconditionally (not gated on `NODE_ENV`) since `lib/env.ts` is the only file allowed to read `process.env` directly. The `try/catch` around `res.json()` stops a non-JSON error body from throwing an unhandled `SyntaxError`. When `json.meta` is present the caller must have instantiated `TData` as `PaginatedResult<TItem>`; `GET /categories` has no `meta` key, so `getCategories` (Task 3) returns a bare array instead.

- [ ] **Step 2: Widen `ApiError.errors` to `unknown` in `lib/api/api-error.ts`**

```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

- [ ] **Step 3: Tick the completed Phase 0 checkboxes in `docs/phase-0-foundation.md`**

Change these two §0.3 checkboxes from `- [ ]` to `- [x]` (the only two this task completes):
- `Create \`lib/api/http.ts\`, mark it \`server-only\`, and implement \`apiFetch<T>()\`...`
- `Default \`auth\` to \`"public"\` and \`cartSession\` to \`false\`...`

Leave every other Phase 0 checkbox untouched — §0.1, §0.2, §0.4, §0.5, §0.6 remain genuinely not done by this plan.

- [ ] **Step 4: Flip Phase 1's status in `docs/README.md`**

In the phase table, change the Phase 1 row's status cell from `**not started**` to `**in progress**`.

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/api/http.ts lib/api/api-error.ts docs/phase-0-foundation.md docs/README.md
git commit -m "fix: make apiFetch mode-aware per documented contract"
```

---

## Phase 2 — Data Layer and Shared Presentational Components

Reusable types, queries, cards, and the error-boundary primitive that Home's sections (Phase 3) consume — none of this is routed or visible yet.

### Task 3: Product and category types and queries

**Files:**
- Create: `features/products/types/product.ts`
- Create: `features/products/queries/get-products.ts`
- Create: `features/categories/types/category.ts`
- Create: `features/categories/queries/get-categories.ts`

**Interfaces:**
- Consumes: `apiFetch`, `PaginatedResult` from Task 2.
- Produces: `ProductSummary`, `ProductDetail`, `ProductImage`, `ProductCategoryRef` types; `GetProductsParams`, `ProductsSortOption`, `getProducts(params?): Promise<PaginatedResult<ProductSummary>>`; `Category`, `SubCategory` types; `getCategories(): Promise<Category[]>`. Consumed by Tasks 4, 5, 7, 8.

- [ ] **Step 1: Write `features/products/types/product.ts`**

```ts
export type ProductImage = {
  id: string;
  imageId: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type ProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  featured: boolean;
  sizes: string[];
  colors: string[];
  quantity: number;
};

export type ProductDetail = ProductSummary & {
  description: string;
  category: ProductCategoryRef;
  subCategories: ProductCategoryRef[];
  images: ProductImage[];
};
```

`ProductDetail`/`ProductImage` aren't used by Home — they're included so this file lands complete on first write, matching the shape `docs/integration/storefront/01-products.md` documents in full. This avoids the sibling product-detail plan's "Create" step turning into a conflicting "Modify" when it eventually executes.

- [ ] **Step 2: Write `features/products/queries/get-products.ts`**

```ts
import "server-only";

import { apiFetch, type PaginatedResult } from "@/lib/api/http";
import type { ProductSummary } from "@/features/products/types/product";

export type ProductsSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "best_selling"
  | "top_rated";

export type GetProductsParams = {
  featured?: boolean;
  sort?: ProductsSortOption;
  limit?: number;
  page?: number;
};

export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedResult<ProductSummary>> {
  const searchParams = new URLSearchParams();

  if (params.featured !== undefined) {
    searchParams.set("featured", String(params.featured));
  }
  if (params.sort !== undefined) {
    searchParams.set("sort", params.sort);
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();

  return apiFetch<PaginatedResult<ProductSummary>>(
    `/products${query ? `?${query}` : ""}`,
    {
      auth: "public",
      next: { revalidate: 120, tags: ["products"] },
    },
  );
}
```

`GetProductsParams` is scoped to what Home needs (`featured`, `sort`, `limit`, `page`), not the full future filter set (`search`/`category`/`sizes`/`colors`/`minPrice`/`maxPrice`) — `docs/phase-1-catalog.md` explicitly separates task 1.2 (full products listing/URL state) from 1.5 (Home) as different checklist items, and this shape extends additively later without a signature break.

- [ ] **Step 3: Write `features/categories/types/category.ts`**

```ts
export type SubCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  subCategories: SubCategory[];
};
```

- [ ] **Step 4: Write `features/categories/queries/get-categories.ts`**

```ts
import "server-only";

import { apiFetch } from "@/lib/api/http";
import type { Category } from "@/features/categories/types/category";

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", {
    auth: "public",
    next: { revalidate: 300, tags: ["categories"] },
  });
}
```

`GET /categories` returns a bare unpaginated array (no `meta` key) per `docs/integration/storefront/02-categories.md` — this is why the return type is `Category[]`, not `PaginatedResult<Category>`.

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add features/products/types features/products/queries features/categories/types features/categories/queries
git commit -m "feat: add product and category types and queries"
```

---

### Task 4: Shared product presentational components

**Files:**
- Create: `components/shared/rating-summary.tsx`
- Create: `features/products/components/stock-badge.tsx`
- Create: `features/products/components/product-card.tsx`
- Modify: `docs/superpowers/plans/2026-07-19-product-detail.md` (add status note)

**Interfaces:**
- Consumes: `Badge` (Task 1), `ProductSummary` (Task 3), `formatEGP` (`lib/format.ts`, existing).
- Produces: `RatingSummary`, `StockBadge`, `ProductCard` — consumed by Tasks 7 and (later, by the sibling plan) product detail/related-products.

- [ ] **Step 1: Write `components/shared/rating-summary.tsx`**

```tsx
import { LucideStar } from "lucide-react";

type RatingSummaryProps = {
  ratingsAverage: string | null;
  ratingsQuantity: number;
};

export function RatingSummary({ ratingsAverage, ratingsQuantity }: RatingSummaryProps) {
  if (ratingsAverage === null) {
    return <p className="text-sm text-muted-foreground">No reviews yet</p>;
  }

  return (
    <p className="flex items-center gap-1 text-sm text-foreground">
      <LucideStar className="size-4 fill-primary text-primary" aria-hidden />
      <span className="font-medium">{ratingsAverage}</span>
      <span className="text-muted-foreground">
        ({ratingsQuantity} {ratingsQuantity === 1 ? "review" : "reviews"})
      </span>
    </p>
  );
}
```

- [ ] **Step 2: Write `features/products/components/stock-badge.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;

type StockBadgeProps = {
  quantity: number;
};

export function StockBadge({ quantity }: StockBadgeProps) {
  if (quantity <= 0) {
    return <Badge variant="destructive">Sold out</Badge>;
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return <Badge variant="warning">Only {quantity} left</Badge>;
  }

  return null;
}
```

`quantity` is an advisory display hint only (stock is reserved at checkout, not on read) — this never blocks the product link.

- [ ] **Step 3: Write `features/products/components/product-card.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";

import { RatingSummary } from "@/components/shared/rating-summary";
import { StockBadge } from "@/features/products/components/stock-badge";
import { formatEGP } from "@/lib/format";
import type { ProductSummary } from "@/features/products/types/product";

type ProductCardProps = {
  product: ProductSummary;
};

export function ProductCard({ product }: ProductCardProps) {
  const isDiscounted = Number(product.discount) > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex w-[75vw] shrink-0 snap-start flex-col gap-2 sm:w-56"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 224px, 75vw"
          className="object-cover"
        />
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</p>
      <RatingSummary
        ratingsAverage={product.ratingsAverage}
        ratingsQuantity={product.ratingsQuantity}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {formatEGP(product.priceAfterDiscount)}
        </span>
        {isDiscounted && (
          <span className="text-xs text-muted-foreground line-through">
            {formatEGP(product.price)}
          </span>
        )}
      </div>
      <StockBadge quantity={product.quantity} />
    </Link>
  );
}
```

`discount` (parsed with `Number(...)`) is the authoritative "is this on sale" signal, not a `priceAfterDiscount !== price` string comparison — money is a decimal string with variable scale, so equivalent values like `"2400.00"` and `"2400"` would compare unequal by string identity. The card is always a link to `/products/[slug]`, even at advisory zero stock, per `docs/screens/home.md`. Width is `w-[75vw] sm:w-56` (not a fixed `w-48` from smaller contexts) to match Home's "cards ~70–80% viewport width with a visible peek of the next card" mobile rail requirement; `snap-start` supports scroll-snapping.

- [ ] **Step 4: Add a status note to the sibling product-detail plan**

At the top of `docs/superpowers/plans/2026-07-19-product-detail.md`, immediately after the `> **For agentic workers:** ...` line, insert:

```markdown

> **Status note:** Task 1 (Badge), Task 2 (apiFetch rewrite + ApiError widening), Task 3 Step 1 (`ProductSummary`/`ProductCategoryRef`/`ProductDetail`/`ProductImage` types), and Task 4 Steps 1, 3, 5 (`RatingSummary`, `StockBadge`, `ProductCard`) were already implemented by the Home screen plan (`docs/superpowers/plans/2026-07-20-home-screen.md`) before this plan runs. Skip those steps and reuse the existing files at `components/ui/badge.tsx`, `lib/api/http.ts`, `lib/api/api-error.ts`, `features/products/types/product.ts`, `components/shared/rating-summary.tsx`, `features/products/components/stock-badge.tsx`, and `features/products/components/product-card.tsx`. Start execution at Task 3 Steps 2–8 (review query, reviews params schema) and Task 4 Steps 2, 4 (`PriceBlock`, `Breadcrumb`).
```

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add components/shared/rating-summary.tsx features/products/components/stock-badge.tsx features/products/components/product-card.tsx docs/superpowers/plans/2026-07-19-product-detail.md
git commit -m "feat: add rating summary, stock badge, and product card"
```

---

### Task 5: Category tile component

**Files:**
- Create: `features/categories/components/category-tile.tsx`

**Interfaces:**
- Consumes: `Category` (Task 3).
- Produces: `CategoryTile` — consumed by Task 8.

- [ ] **Step 1: Write `features/categories/components/category-tile.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { LucideImage } from "lucide-react";

import type { Category } from "@/features/categories/types/category";

type CategoryTileProps = {
  category: Category;
};

export function CategoryTile({ category }: CategoryTileProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex flex-col items-center gap-2 text-center"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 150px, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LucideImage className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">{category.name}</p>
    </Link>
  );
}
```

No placeholder image asset exists in `public/` (only stock `create-next-app` SVGs), so a null `imageUrl` renders a muted icon tile instead of a broken/fabricated image path — this is the "stable fallback graphic" `docs/screens/home.md` requires.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/categories/components/category-tile.tsx
git commit -m "feat: add category tile"
```

---

### Task 6: Shared section error boundary

**Files:**
- Create: `components/shared/section-error-boundary.tsx`

**Interfaces:**
- Produces: `SectionErrorBoundary({ title: string; children: ReactNode })` — consumed by Task 10.

- [ ] **Step 1: Write `components/shared/section-error-boundary.tsx`**

```tsx
"use client";

import { unstable_catchError as catchError, type ErrorInfo } from "next/error";

import { Button } from "@/components/ui/button";

type SectionErrorFallbackProps = {
  title: string;
};

function SectionErrorFallback(
  { title }: SectionErrorFallbackProps,
  { unstable_retry }: ErrorInfo,
) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border py-10 text-center">
      <p className="text-sm text-muted-foreground">{title} is unavailable right now.</p>
      <Button variant="outline" size="sm" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </div>
  );
}

export const SectionErrorBoundary = catchError(SectionErrorFallback);
```

Route-level `error.tsx` only wraps a whole route segment, not independent sections within one page. `unstable_catchError` (this Next.js version's component-level error boundary, verified in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md`) wraps any subtree instead, giving Category/Featured/New-Arrivals independent failure isolation per `docs/phase-1-catalog.md` §1.5. `unstable_retry()` re-fetches and re-renders the boundary's children (unlike `reset()`, which only clears error state) — retry is user-triggered only via the button, never automatic, per the rate-limit rules in `docs/integration/storefront/00-conventions.md`.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shared/section-error-boundary.tsx
git commit -m "feat: add reusable section error boundary"
```

---

## Phase 3 — Home Content Sections

The actual Home screen at `/` — Hero, Shop by Category, Featured, New Arrivals, composed and routed. First point in the plan with something to load in a browser.

### Task 7: `ProductSection` (generic) and its loading skeleton

**Files:**
- Create: `features/home/components/product-section.tsx`
- Create: `features/home/components/product-section-skeleton.tsx`

**Interfaces:**
- Consumes: `getProducts`, `GetProductsParams` (Task 3), `ProductCard` (Task 4), `Skeleton` (Task 1).
- Produces: `ProductSection({ title, viewAllHref, queryParams })`, `ProductSectionSkeleton({ title })` — consumed by Task 10. This is the generic component the user specifically asked for: Featured and New Arrivals are two instances of this one component, differing only by props.

- [ ] **Step 1: Write `features/home/components/product-section.tsx`**

```tsx
import Link from "next/link";

import { ProductCard } from "@/features/products/components/product-card";
import {
  getProducts,
  type GetProductsParams,
} from "@/features/products/queries/get-products";

type ProductSectionProps = {
  title: string;
  viewAllHref: string;
  queryParams: GetProductsParams;
};

export async function ProductSection({ title, viewAllHref, queryParams }: ProductSectionProps) {
  const { items } = await getProducts(queryParams);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div
        tabIndex={0}
        className="flex snap-x gap-4 overflow-x-auto pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

`queryParams` is passed straight to `getProducts` — this is the whole mechanism that makes one component serve both Featured (`{ featured: true, limit: 10 }`) and New Arrivals (`{ sort: "newest", limit: 10 }`) in Task 10. Renders nothing (not an empty rail) when there are no matching products, per `docs/screens/home.md`'s rule for Featured, applied uniformly to New Arrivals too. `tabIndex={0}` on the scroll container makes it arrow-key scrollable when focused, satisfying the narrow-width "scrollable by touch and by arrow keys when focused" requirement.

- [ ] **Step 2: Write `features/home/components/product-section-skeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

type ProductSectionSkeletonProps = {
  title: string;
};

const SKELETON_CARD_COUNT = 4;

export function ProductSectionSkeleton({ title }: ProductSectionSkeletonProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <div key={index} className="flex w-[75vw] shrink-0 flex-col gap-2 sm:w-56">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add features/home/components/product-section.tsx features/home/components/product-section-skeleton.tsx
git commit -m "feat: add generic ProductSection and its loading skeleton"
```

---

### Task 8: `CategorySection` and its loading skeleton

**Files:**
- Create: `features/home/components/category-section.tsx`
- Create: `features/home/components/category-section-skeleton.tsx`

**Interfaces:**
- Consumes: `getCategories` (Task 3), `CategoryTile` (Task 5), `Skeleton` (Task 1).
- Produces: `CategorySection`, `CategorySectionSkeleton` — consumed by Task 10.

- [ ] **Step 1: Write `features/home/components/category-section.tsx`**

```tsx
import Link from "next/link";

import { CategoryTile } from "@/features/categories/components/category-tile";
import { getCategories } from "@/features/categories/queries/get-categories";

const MAX_HOME_CATEGORIES = 8;

export async function CategorySection() {
  const categories = await getCategories();
  const topLevelCategories = categories.slice(0, MAX_HOME_CATEGORIES);

  if (topLevelCategories.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Shop by Category</h2>
        {categories.length > MAX_HOME_CATEGORIES && (
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {topLevelCategories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
```

Caps at 8 top-level categories (not the nested `subCategories`); "View all" only renders when more than 8 exist, per `docs/screens/home.md`. Fewer than 8 renders exactly what's there, no placeholder tiles.

- [ ] **Step 2: Write `features/home/components/category-section-skeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_TILE_COUNT = 6;

export function CategorySectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: SKELETON_TILE_COUNT }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add features/home/components/category-section.tsx features/home/components/category-section-skeleton.tsx
git commit -m "feat: add CategorySection and its loading skeleton"
```

---

### Task 9: Hero

**Files:**
- Create: `features/home/components/hero.tsx`

**Interfaces:**
- Consumes: `Button` (existing).
- Produces: `Hero` — consumed by Task 10.

- [ ] **Step 1: Write `features/home/components/hero.tsx`**

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-md sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-4 bg-muted px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Elegant Couture, Delivered to Your Door
        </h1>
        <p className="text-muted-foreground">Discover this season&apos;s collection.</p>
        <Button render={<Link href="/products" />} className="w-full sm:w-fit">
          Shop Now →
        </Button>
      </div>
      <div
        aria-hidden
        className="aspect-[4/3] w-full bg-gradient-to-br from-primary/30 to-primary/10 sm:aspect-square sm:w-full sm:max-w-md"
      />
    </section>
  );
}
```

Hardcoded headline/subtext/CTA, no backend call, per `docs/screens/home.md`. No hero photography exists yet (`public/` has only stock `create-next-app` SVGs) — this renders a decorative gradient panel instead of a `next/image` pointed at a path that doesn't exist. Swap in a real image once a hero asset is supplied. `Button`'s `render` prop swaps its rendered element for `Link` while keeping button styling — the base-lyra polymorphism pattern (not Radix `asChild`), already used this way in the sibling product-detail plan.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/home/components/hero.tsx
git commit -m "feat: add static Hero section"
```

---

### Task 10: `HomeFeature` composition and route wiring

**Files:**
- Create: `features/home/index.tsx`
- Modify: `app/page.tsx`
- Modify: `docs/phase-1-catalog.md` (tick §1.5 checkboxes)

**Interfaces:**
- Consumes: everything from Tasks 6–9.
- Produces: default export `HomeFeature` — consumed by `app/page.tsx`.

- [ ] **Step 1: Write `features/home/index.tsx`**

```tsx
import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { CategorySection } from "@/features/home/components/category-section";
import { CategorySectionSkeleton } from "@/features/home/components/category-section-skeleton";
import { Hero } from "@/features/home/components/hero";
import { ProductSection } from "@/features/home/components/product-section";
import { ProductSectionSkeleton } from "@/features/home/components/product-section-skeleton";

export default function HomeFeature() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      <SectionErrorBoundary title="Shop by Category">
        <Suspense fallback={<CategorySectionSkeleton />}>
          <CategorySection />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Featured">
        <Suspense fallback={<ProductSectionSkeleton title="Featured" />}>
          <ProductSection
            title="Featured"
            viewAllHref="/products?featured=true"
            queryParams={{ featured: true, limit: 10 }}
          />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="New Arrivals">
        <Suspense fallback={<ProductSectionSkeleton title="New Arrivals" />}>
          <ProductSection
            title="New Arrivals"
            viewAllHref="/products"
            queryParams={{ sort: "newest", limit: 10 }}
          />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
```

`HomeFeature` itself has no top-level `await` — each dynamic section starts fetching as soon as React begins rendering it under its own `<Suspense>`, so the three async sections stream and resolve independently and in parallel without a manual `Promise.all`, satisfying `docs/phase-1-catalog.md` §1.5's "fetch independent rails in parallel." Each `SectionErrorBoundary` wraps its `<Suspense>` (not the other way around) so a rail failure replaces the skeleton with the retry UI instead of the skeleton hiding the error.

- [ ] **Step 2: Rewrite `app/page.tsx`**

```tsx
import HomeFeature from "@/features/home";

export default function HomePage() {
  return <HomeFeature />;
}
```

This replaces the stock `create-next-app` starter page.

- [ ] **Step 3: Tick the completed checkboxes in `docs/phase-1-catalog.md`**

Under "### 1.5 Home storefront", change all three `- [ ]` items to `- [x]`. Leave 1.1, 1.2, 1.3, 1.4 as `- [ ]` — not part of this plan.

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/home/index.tsx app/page.tsx docs/phase-1-catalog.md
git commit -m "feat: wire HomeFeature and the / route"
```

---

## Phase 4 — Shared Shell

Navbar/Footer wrapping every route. Independent of Phase 2/3 content — only needs Phase 1's `Sheet`/`Button` — so it can be implemented in parallel with Phases 2–3 if using multiple implementers.

### Task 11: Navbar

**Files:**
- Create: `components/shared/navbar/index.tsx`
- Create: `components/shared/navbar/navbar-mobile-menu.tsx`

**Interfaces:**
- Consumes: `Button` (existing), `Sheet`/`SheetTrigger`/`SheetContent`/`SheetHeader`/`SheetTitle` (Task 1, adapt to the generated API per Task 1 Step 4).
- Produces: `Navbar` — consumed by Task 13.

- [ ] **Step 1: Write `components/shared/navbar/navbar-mobile-menu.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideMenu, LucideSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavbarMobileMenuProps = {
  navLinks: { href: string; label: string }[];
};

export function NavbarMobileMenu({ navLinks }: NavbarMobileMenuProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 sm:hidden">
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Search" />}>
          <LucideSearch />
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form action="/products" method="GET" className="px-4 pb-4">
            <input
              type="search"
              name="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <LucideMenu />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Main" className="flex flex-col gap-4 px-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsNavOpen(false)}
                className="text-sm font-medium text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button variant="outline" size="sm" disabled>
              Sign in
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

Two separate sheets (search, nav) matching `docs/screens/shared-shell.md`'s narrow-width wireframe: `[☰]` opens the nav sheet, `[🔍]` opens a dedicated search sheet with the same input. `SheetTrigger`'s `render` prop assumes the base-lyra composition pattern recorded in Task 1 Step 4 — adjust if the generated file differs. Sign-in renders `disabled` (no live Clerk state, no `href` to a `/sign-in` route that doesn't exist yet — Phase 3 scope).

- [ ] **Step 2: Write `components/shared/navbar/index.tsx`**

```tsx
import Link from "next/link";
import { LucideHeart, LucideShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavbarMobileMenu } from "@/components/shared/navbar/navbar-mobile-menu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-heading text-lg font-semibold text-foreground">
          SG Couture
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/products" method="GET" className="hidden flex-1 sm:flex">
          <input
            type="search"
            name="search"
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled aria-label="Wishlist" className="hidden sm:inline-flex">
            <LucideHeart />
          </Button>
          <Button variant="ghost" size="icon" disabled aria-label="Cart" className="hidden sm:inline-flex">
            <LucideShoppingBag />
          </Button>
          <Button variant="outline" size="sm" disabled className="hidden sm:inline-flex">
            Sign in
          </Button>
          <NavbarMobileMenu navLinks={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
```

Search is a plain `<form method="GET" action="/products">` — it navigates to `/products?search=<value>` on submit with zero client JS, matching `docs/screens/shared-shell.md`'s "no live-search API; plain navigate-on-submit field." Wishlist, cart, and sign-in are `disabled` placeholders (their real data is Phase 4/2/3 respectively) — `Navbar` stays a pure Server Component; only `NavbarMobileMenu` needs client state for the sheets.

- [ ] **Step 3: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/shared/navbar
git commit -m "feat: add Navbar with mobile nav/search sheets"
```

---

### Task 12: Footer

**Files:**
- Create: `components/shared/footer/index.tsx`

**Interfaces:**
- Produces: `Footer` — consumed by Task 13.

- [ ] **Step 1: Write `components/shared/footer/index.tsx`**

```tsx
import Link from "next/link";
import { LucideFacebook, LucideInstagram } from "lucide-react";

import { Button } from "@/components/ui/button";

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="font-heading text-lg font-semibold text-foreground">SG Couture</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Elegant couture, delivered to your door.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <LucideInstagram className="size-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <LucideFacebook className="size-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Shop</span>
          {SHOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Stay in the loop</span>
          <p className="max-w-xs text-sm text-muted-foreground">Get updates on new arrivals.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              disabled
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground outline-none"
            />
            <Button type="button" size="sm" disabled>
              Notify me
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-border px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} SG Couture. All rights reserved.</p>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
          Cash on Delivery
        </span>
      </div>
    </footer>
  );
}
```

The Customer Care column (About/Contact/Shipping & Returns) is intentionally omitted — no phase doc covers those pages, and `docs/screens/shared-shell.md` says to never link to a route that doesn't exist. The newsletter email input and button are both `disabled` — visual-only, no submit handler, no backend endpoint exists for it.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shared/footer
git commit -m "feat: add Footer"
```

---

### Task 13: Wire Navbar/Footer into the root layout (final integration)

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `Navbar` (Task 11), `Footer` (Task 12).

- [ ] **Step 1: Update `app/layout.tsx`**

Add the imports:

```tsx
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
```

Replace the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: "SG Couture",
  description: "Elegant couture, delivered to your door.",
};
```

Replace the `<body>` contents:

```tsx
<body className="min-h-full flex flex-col">
  <Navbar />
  <main className="flex-1">{children}</main>
  <Footer />
</body>
```

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Manual browser Definition of Done**

Run: `bun dev`, then in a browser (with the `sg-couture-api` backend reachable):

- Visit `/`. Confirm view-source (or a hard refresh) shows the Hero headline, category tile names, and Featured/New Arrivals product names/prices in the initial HTML — not a client loading shell.
- Confirm Featured shows the struck-through original price and correct badge only for discounted/low-stock/sold-out products; confirm a product with `ratingsAverage: null` renders "No reviews yet".
- Confirm "Shop by Category" caps at 8 tiles and only shows "View all" when the backend has more than 8 categories; confirm a category with a null `imageUrl` renders the muted icon fallback, not a broken image.
- At a narrow viewport: confirm the category grid wraps to 2–3 columns with no horizontal scroll, and Featured/New Arrivals become a horizontal-scroll rail with a visible peek of the next card; confirm the rail scrolls by touch and by arrow keys once focused (click into the rail, press the right arrow key).
- Submit the navbar search field with a value and confirm it navigates to `/products?search=<value>` (the page will 404 until a later phase — confirm the URL is correct, not that the page renders).
- At a narrow viewport, open the hamburger menu and the search icon separately; confirm each opens its own sheet and the nav sheet's links close the sheet on click.
- Confirm the wishlist icon, cart icon, and Sign in control are visibly present but non-interactive (no navigation, no console errors) on both the desktop navbar and the mobile nav sheet.
- Temporarily point `API_URL` at an unreachable host (or stop the backend) and reload `/`; confirm each of Shop by Category, Featured, and New Arrivals independently render "... is unavailable right now." with a working "Try again" button — and confirm the Hero and the other two sections still render normally while one is broken. Restore `API_URL` afterward.
- Confirm the Footer renders with Shop links, social icons, a disabled newsletter input/button, and the Cash on Delivery badge — and that there is no Customer Care column.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire Navbar and Footer into the root layout"
```

---

## Self-Review Notes

- **Spec coverage:** `docs/screens/home.md`'s four sections (Hero, Shop by Category, Featured, New Arrivals), the desktop/narrow layouts, and the per-section loading/error boundary requirement all map to Tasks 6–10. `docs/screens/shared-shell.md`'s Navbar/Footer map to Tasks 11–13, with the Customer Care column and live Clerk/cart/wishlist state explicitly deferred per that doc's own guidance.
- **Type consistency:** `ProductSummary` (Task 3) is the single card-shape type used by `getProducts`, `ProductCard`, and `ProductSection`; `Category` (Task 3) is the single type used by `getCategories`, `CategoryTile`, and `CategorySection`. No divergent per-task types.
- **No placeholders:** every step contains complete file content or an exact, minimal diff instruction; the one exception (Task 1's shadcn-generated Badge/Skeleton/Sheet files) states exactly what to insert and where, since the surrounding generated boilerplate is only known once the CLI runs — the same pattern already used by the sibling product-detail plan.
