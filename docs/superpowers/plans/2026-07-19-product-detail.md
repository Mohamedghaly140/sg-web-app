# Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/products/[slug]` as a server-rendered Product Detail page — gallery, price/rating/variant info panel, description, paginated public reviews, and a same-category related-products rail — matching `docs/screens/product-detail.md` and `docs/phase-1-catalog.md` tasks 1.3 and 1.4.

**Architecture:** Thin `app/products/[slug]/page.tsx` over a `ProductFeature` Server Component that calls `features/products/queries/*` and `features/reviews/queries/*` through the server-only `apiFetch`. All data is Public (no Clerk token, no cart session). Gallery and size/color/quantity selectors are small Client Component islands holding local `useState` only — no cart or wishlist wiring, per the documented Phase 1/Phase 2/Phase 4 split.

**Tech Stack:** Next.js 16 App Router (Server Components), TypeScript, Tailwind v4, shadcn `base-lyra` on `@base-ui/react`, nuqs (server-side `createSearchParamsCache` only), Bun.

## Global Constraints

- Bun only — never `npm`/`npx`/`yarn`. Run `bunx tsc --noEmit` and `bun lint` after every task; both must be clean before committing.
- No automated test suite exists in this repo (confirmed in `CLAUDE.md`/`docs/01-conventions.md` §8). Do not invent a test runner or `*.test.ts` files. Each task's verification is `bunx tsc --noEmit` + `bun lint` + a stated manual/browser check; the final task carries the full browser Definition of Done.
- All backend calls go through the server-only `apiFetch` in `lib/api/http.ts`; the browser never calls the backend. Every query in this plan uses `auth: "public"` (no Clerk token, no `cartSession`).
- Money is a decimal string, formatted only via `formatEGP()`; ratings decimals are strings too. Never do client-side money arithmetic. `ratingsAverage: null` must render "No reviews yet", never zero stars.
- Branch on `ApiError.code`, never on `.message`.
- Badge styling uses only the semantic variants added in Task 1 (`success`, `warning`, `info`, `destructive`, `secondary`, `outline`) — never literal color classes.
- Lucide icons import with the `Lucide` prefix (`LucideStar`, never `Star`).
- Component prop types are named `<ComponentName>Props`; files are kebab-case; each feature's default export is `<Name>Feature`.
- `app/` pages stay thin; all logic lives in `features/<name>/`.
- Add to Cart / Buy Now / wishlist are **out of scope** (Phase 2 and Phase 4 respectively, per `docs/phase-1-catalog.md`'s "Out of scope" section) — render as disabled/placeholder UI only, never wired to a live action.

---

## Why Task 1 and Task 2 exist (read before starting)

Research confirmed Phase 0 is not actually finished despite the tracker: `lib/api/http.ts` unconditionally requires a Clerk session (`await auth()` → `getToken()`, throwing `ApiError(401, "UNAUTHENTICATED", ...)` if absent) and has none of the documented `auth`/`cartSession`/`cache`/`next` options. Every query in this plan is a guest-visible Public read, so nothing in this plan can work until `apiFetch` is fixed. `components/ui/badge.tsx` is also missing entirely, even though `components/shared/active-badge.tsx` already imports it and doesn't compile today.

This was reviewed with `fable-advisor`, which approved folding both fixes into this plan as Task 1 (Badge) and Task 2 (apiFetch) rather than treating them as a separate blocking plan — nothing currently calls `apiFetch` (no `features/` directory exists yet), so there are zero existing callers to break. See that task for the specific correctness conditions the advisor flagged (Clerk `auth()` must not run on `"public"` calls, cache-metadata gating needs an unconditional assertion that never reads `process.env` outside `lib/env.ts`, non-JSON error bodies must not crash the parser, etc.).

---

### Task 1: Add the `Badge` primitive with semantic variants

**Files:**
- Create: `components/ui/badge.tsx` (via shadcn CLI, then edited)
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `Badge` component from `@/components/ui/badge` accepting `variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"` — consumed by `components/shared/active-badge.tsx` (already exists, currently broken) and every task from Task 4 onward.

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

- [ ] **Step 2: Generate the Badge primitive**

Run: `bunx shadcn@latest add badge`
Expected: creates `components/ui/badge.tsx` with a `badgeVariants` `cva(...)` call (matching the pattern already in `components/ui/button.tsx`) and a `Badge` component, using the existing `base-lyra` style from `components.json`.

- [ ] **Step 3: Add the three semantic variants**

Open the generated `components/ui/badge.tsx`. Inside the `cva(...)` call's `variants: { variant: { ... } }` object, insert these three entries immediately after the existing `outline:` entry (matching the `bg-<color>/10 text-<color>` tint pattern `button.tsx`'s `destructive` variant already uses):

```ts
        success:
          "bg-success/10 text-success dark:bg-success/20",
        warning:
          "bg-warning/10 text-warning dark:bg-warning/20",
        info:
          "bg-info/10 text-info dark:bg-info/20",
```

If the generated file's variant keys or formatting differ from `button.tsx`'s pattern, match whatever style the generated `default`/`secondary`/`outline` entries already use — the three new entries must look native to the generated file, not bolted on.

- [ ] **Step 4: Verify `active-badge.tsx` now compiles**

Run: `bunx tsc --noEmit`
Expected: no errors from `components/shared/active-badge.tsx` (it already does `import { Badge } from "@/components/ui/badge"` and uses `variant={active ? "success" : "outline"}`).

- [ ] **Step 5: Lint**

Run: `bun lint`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add components/ui/badge.tsx app/globals.css
git commit -m "feat: add Badge primitive with success/warning/info variants"
```

---

### Task 2: Make `apiFetch` mode-aware and sync its documented signature

**Files:**
- Modify: `lib/api/http.ts` (full rewrite)
- Modify: `lib/api/api-error.ts`
- Modify: `docs/phase-0-foundation.md` (tick relevant checkboxes)
- Modify: `docs/README.md` (flip Phase 1 status to "in progress")

**Interfaces:**
- Produces: `apiFetch<TData = undefined>(path: string, options?: ApiFetchOptions): Promise<TData>` — the unwrapped `data` payload, exactly matching the existing `declare function apiFetch<T>(...): Promise<T>` signature already documented byte-identically in `docs/00-architecture.md`, `docs/01-conventions.md`, `docs/phase-0-foundation.md`, `CLAUDE.md`, and `AGENTS.md` (confirmed via `grep -n "declare function apiFetch" -A3 -B15` across all five — none of them need to change). Paginated list endpoints instantiate `TData` as `PaginatedResult<TItem>`.
- Produces: `ApiAuthMode`, `ApiFetchOptions`, `PageMeta`, `PaginatedResult<TItem> = { items: TItem[]; meta: PageMeta }` (all exported from `lib/api/http.ts`) — every later task's queries consume these.
- Produces: `ApiError(status: number, code: string, message: string, errors?: unknown)` from `lib/api/api-error.ts`.

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

Notes on why each piece is here (do not simplify these away):
- Clerk's `auth()` is called only for `"optional"`/`"required"` — calling it unconditionally would opt every route (including Public catalog pages) into dynamic rendering and silently defeat the `next: { revalidate }` caching this plan's queries rely on.
- The assertion enforces ADR-W008's hard rule (cache metadata only on public, non-cart-session calls) even when no identity value is currently present. It runs unconditionally rather than gating on `process.env.NODE_ENV` — `lib/env.ts` is the only file allowed to read `process.env` directly, and the check is cheap enough that there's no reason to special-case it out of production.
- `cartSession` reads `sg_cart_session` directly via `cookies()` — it does not depend on the not-yet-built `lib/cart-session.ts`, so this signature never has to change again in Phase 2.
- The `try/catch` around `res.json()` stops a non-JSON error body (e.g. an HTML page from a rate limiter or proxy in front of the API) from throwing an unhandled `SyntaxError` instead of a catchable `ApiError`.
- `apiFetch` returns the bare unwrapped `data` payload — exactly the documented `Promise<T>` contract every existing Server Action example in `CLAUDE.md`/`AGENTS.md` already relies on (e.g. `const transportCart = await apiFetch<CartTransport>(...)` uses `transportCart` directly). Paginated endpoints are the one case where the envelope carries something beside `data`: when `meta` is present, the caller must have instantiated `TData` as `PaginatedResult<TItem>`, so wrapping `json.data` under `items` alongside `meta` produces exactly that shape at runtime. This relies on callers matching `TData` to whether the endpoint they're calling is documented as paginated — the same documentation-driven discipline the rest of this codebase already uses for hand-written response types.

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

(Business error shapes vary by `code` — stock errors, variant errors, and validation errors all have different `errors[]` shapes per `docs/integration/storefront/00-conventions.md`. Typed narrowers for those come later, when the codes they narrow are actually consumed.)

- [ ] **Step 3: Tick the completed Phase 0 checkboxes in `docs/phase-0-foundation.md`**

Change the following two checkboxes from `- [ ]` to `- [x]` (they are the only two Phase 0 items this task completes):
- The §0.3 line: `Create \`lib/api/http.ts\`, mark it \`server-only\`, and implement \`apiFetch<T>()\`...`
- The §0.3 line: `Default \`auth\` to \`"public"\` and \`cartSession\` to \`false\`...`

Do not tick any other Phase 0 checkbox — the rest of Phase 0 (providers, `proxy.ts`, shell, shadcn baseline beyond `badge`) remains genuinely not done. No doc file needs its `apiFetch` code block edited: `docs/00-architecture.md`, `docs/01-conventions.md`, `docs/phase-0-foundation.md`, `CLAUDE.md`, and `AGENTS.md` already document the exact unwrapped `Promise<T>` signature this rewrite implements, including the line "Unwrap successful `{ status, message, data, meta? }` responses into the typed domain result. List wrappers retain the documented `meta` beside `data`" (`docs/01-conventions.md` §1) — that sentence already describes `PaginatedResult`.

- [ ] **Step 4: Flip Phase 1's status in `docs/README.md`**

In the phase table, change the Phase 1 row's status cell from `**not started**` to `**in progress**` (this plan starts Phase 1 with a scoped Phase 0 carve-out, not a claim that Phase 0 is fully done).

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0. (`lib/pagination.ts` already imports `PageMeta` from `lib/api/http.ts` — confirm it still resolves.)

- [ ] **Step 6: Commit**

```bash
git add lib/api/http.ts lib/api/api-error.ts docs/phase-0-foundation.md docs/README.md
git commit -m "fix: make apiFetch mode-aware per documented contract"
```

---

### Task 3: Product and review types, queries, and the reviews URL-state schema

**Files:**
- Create: `features/products/types/product.ts`
- Create: `features/products/queries/get-product.ts`
- Create: `features/products/queries/get-related-products.ts`
- Create: `features/reviews/types/review.ts`
- Create: `features/reviews/hooks/use-reviews-params.ts`
- Create: `features/reviews/queries/get-product-reviews.ts`

**Interfaces:**
- Consumes: `apiFetch`, `PageMeta`, `PaginatedResult`, `ApiError` from Task 2.
- Produces: `ProductSummary`, `ProductDetail`, `ProductImage`, `ProductCategoryRef` types; `getProduct(slug: string): Promise<ProductDetail | null>`; `getRelatedProducts(categorySlug: string, excludeProductId: string): Promise<ProductSummary[]>`; `Review` type; `reviewsParamsParsers`, `reviewsSearchParamsCache`; `getProductReviews(productId: string, page: number, limit: number): Promise<{ reviews: Review[]; meta: PageMeta }>`. All consumed by Tasks 4–9.

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

- [ ] **Step 2: Write `features/products/queries/get-product.ts`**

```ts
import "server-only";

import { cache } from "react";

import { apiFetch } from "@/lib/api/http";
import { ApiError } from "@/lib/api/api-error";
import type { ProductDetail } from "@/features/products/types/product";

export const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    return await apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
      auth: "public",
      next: { revalidate: 120, tags: [`product:${slug}`] },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return null;
    }
    throw error;
  }
});
```

Wrapping in React's `cache()` means `generateMetadata` and the page body can both call `getProduct(slug)` and only one request hits the backend per render, per `docs/phase-1-catalog.md` task 1.3's "same cached server query" requirement.

- [ ] **Step 3: Write `features/products/queries/get-related-products.ts`**

```ts
import "server-only";

import { apiFetch, type PaginatedResult } from "@/lib/api/http";
import type { ProductSummary } from "@/features/products/types/product";

const RELATED_PRODUCTS_LIMIT = 8;

export async function getRelatedProducts(
  categorySlug: string,
  excludeProductId: string,
): Promise<ProductSummary[]> {
  const { items } = await apiFetch<PaginatedResult<ProductSummary>>(
    `/products?category=${encodeURIComponent(categorySlug)}&limit=${RELATED_PRODUCTS_LIMIT}`,
    {
      auth: "public",
      next: { revalidate: 120, tags: [`products:category:${categorySlug}`] },
    },
  );

  return items.filter((product) => product.id !== excludeProductId);
}
```

There is no dedicated related-products endpoint in the contract (`docs/integration/storefront/01-products.md`) — this reuses `GET /products?category=` and filters the current product out client-side, per `docs/screens/product-detail.md` §6.

- [ ] **Step 4: Write `features/reviews/types/review.ts`**

```ts
export type Review = {
  id: string;
  title: string;
  ratings: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
};
```

- [ ] **Step 5: Write `features/reviews/hooks/use-reviews-params.ts`**

```ts
import { createParser, createSearchParamsCache, parseAsInteger } from "nuqs/server";

const parseAsPage = createParser({
  parse: (value) => {
    const parsed = parseAsInteger.parse(value);
    return parsed !== null && parsed >= 1 ? parsed : null;
  },
  serialize: (value) => String(value),
}).withDefault(1);

const parseAsReviewLimit = createParser({
  parse: (value) => {
    const parsed = parseAsInteger.parse(value);
    return parsed !== null && parsed >= 1 && parsed <= 100 ? parsed : null;
  },
  serialize: (value) => String(value),
}).withDefault(20);

export const reviewsParamsParsers = {
  page: parseAsPage,
  limit: parseAsReviewLimit,
};

export const reviewsSearchParamsCache = createSearchParamsCache(reviewsParamsParsers);
```

This is the one nuqs params schema for the reviews feature, per `docs/01-conventions.md` §6, which requires "apply defaults and validation in the shared parser definition so server and client cannot drift." A bare `parseAsInteger.withDefault(...)` only substitutes the default when parsing fails (non-numeric input) — an in-range-looking but invalid value like `?page=0`, `?page=-1`, or `?limit=101` would parse successfully and pass straight through to `GET /products/:id/reviews`, which enforces `page >= 1` and `limit` 1–100 and would 422. `parseAsPage`/`parseAsReviewLimit` reject out-of-range values by returning `null` from `parse`, which falls back to the parser's own default (`1` / `20`) exactly like a missing param — normalizing bad URL state instead of forwarding it to the backend. Only the server half (`createSearchParamsCache`) is wired here — review pagination on this page is server-rendered numbered links, not a client filter control, so it does not need `useQueryStates`/`NuqsAdapter` (which Phase 0 hasn't built yet). Add the client `useQueryStates` half only if a future phase adds client-side review interaction on this page.

- [ ] **Step 6: Write `features/reviews/queries/get-product-reviews.ts`**

```ts
import "server-only";

import { apiFetch, type PageMeta, type PaginatedResult } from "@/lib/api/http";
import type { Review } from "@/features/reviews/types/review";

export async function getProductReviews(
  productId: string,
  page: number,
  limit: number,
): Promise<{ reviews: Review[]; meta: PageMeta }> {
  const { items, meta } = await apiFetch<PaginatedResult<Review>>(
    `/products/${encodeURIComponent(productId)}/reviews?page=${page}&limit=${limit}`,
    {
      auth: "public",
      next: { revalidate: 60, tags: [`product:${productId}:reviews`] },
    },
  );

  return { reviews: items, meta };
}
```

`GET /products/:id/reviews` is keyed by the product's `id`, not its `slug` (`docs/integration/storefront/03-reviews.md`). An unknown product ID returns an empty paginated result, not a 404 — no special-casing needed here.

- [ ] **Step 7: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add features/products/types features/products/queries features/reviews/types features/reviews/hooks features/reviews/queries
git commit -m "feat: add product/review types, queries, and reviews params schema"
```

---

### Task 4: Shared `RatingSummary` and product presentational pieces

**Files:**
- Create: `components/shared/rating-summary.tsx`
- Create: `features/products/components/price-block.tsx`
- Create: `features/products/components/stock-badge.tsx`
- Create: `features/products/components/breadcrumb.tsx`
- Create: `features/products/components/product-card.tsx`

**Interfaces:**
- Consumes: `Badge` (Task 1), `ProductSummary`/`ProductCategoryRef` (Task 3), `formatEGP` (`lib/format.ts`, existing).
- Produces: `RatingSummary`, `PriceBlock`, `StockBadge`, `Breadcrumb`, `ProductCard` components — consumed by Tasks 5–9.

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

This is shared (not feature-local) because both the product info panel (Task 6) and the reviews section header (Task 7) render it.

- [ ] **Step 2: Write `features/products/components/price-block.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";
import { formatEGP } from "@/lib/format";

type PriceBlockProps = {
  price: string;
  discount: string;
  priceAfterDiscount: string;
};

export function PriceBlock({ price, discount, priceAfterDiscount }: PriceBlockProps) {
  const isDiscounted = Number(discount) > 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-semibold text-foreground">
        {formatEGP(priceAfterDiscount)}
      </span>
      {isDiscounted && (
        <>
          <span className="text-sm text-muted-foreground line-through">{formatEGP(price)}</span>
          <Badge variant="destructive">-{Number(discount)}%</Badge>
        </>
      )}
    </div>
  );
}
```

`discount` (already parsed with `Number(discount)` for the badge label) is the authoritative "is this product on sale" signal, not a `priceAfterDiscount !== price` string comparison — money is a decimal string with variable scale (`docs/01-conventions.md`), so equivalent values like `"2400.00"` and `"2400"` would compare unequal by string identity and render a false struck-through price with a `-0%` badge. Checking `discount` avoids that without doing arithmetic on the money fields themselves.

- [ ] **Step 3: Write `features/products/components/stock-badge.tsx`**

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

`quantity` is advisory display data only (stock is reserved at checkout, not on read) — this never blocks navigation, only informs it.

- [ ] **Step 4: Write `features/products/components/breadcrumb.tsx`**

```tsx
import Link from "next/link";

import type { ProductCategoryRef } from "@/features/products/types/product";

type BreadcrumbProps = {
  category: ProductCategoryRef;
  subCategory: ProductCategoryRef | undefined;
  productName: string;
};

export function Breadcrumb({ category, subCategory, productName }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
        {category.name}
      </Link>
      {subCategory && (
        <>
          <span aria-hidden>/</span>
          <Link
            href={`/categories/${category.slug}?subCategory=${subCategory.slug}`}
            className="hover:text-foreground"
          >
            {subCategory.name}
          </Link>
        </>
      )}
      <span aria-hidden>/</span>
      <span className="text-foreground">{productName}</span>
    </nav>
  );
}
```

- [ ] **Step 5: Write `features/products/components/product-card.tsx`**

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
    <Link href={`/products/${product.slug}`} className="flex w-48 shrink-0 flex-col gap-2 sm:w-56">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 224px, 192px"
          className="object-cover"
        />
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</p>
      <RatingSummary ratingsAverage={product.ratingsAverage} ratingsQuantity={product.ratingsQuantity} />
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

Built to the exact shape `docs/phase-1-catalog.md` task 1.2 specifies for the shared `ProductCard` (image, name, `formatEGP()` price, original price only when discounted, nullable rating, semantic stock badge, always-usable link) — so the future product-listing/category/home tasks can reuse this file as-is instead of duplicating it.

- [ ] **Step 6: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add components/shared/rating-summary.tsx features/products/components/price-block.tsx features/products/components/stock-badge.tsx features/products/components/breadcrumb.tsx features/products/components/product-card.tsx
git commit -m "feat: add rating summary, price block, stock badge, breadcrumb, product card"
```

---

### Task 5: Gallery client island

**Files:**
- Create: `features/products/components/gallery.tsx`

**Interfaces:**
- Consumes: `ProductImage` (Task 3), `cn` (`lib/utils.ts`, existing).
- Produces: `Gallery` component — consumed by Task 9.

- [ ] **Step 1: Write `features/products/components/gallery.tsx`**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ProductImage } from "@/features/products/types/product";

type GalleryProps = {
  images: ProductImage[];
  fallbackImageUrl: string;
  productName: string;
};

export function Gallery({ images, fallbackImageUrl, productName }: GalleryProps) {
  const galleryImages = images.filter((image) => image.imageUrl !== null);
  const slides =
    galleryImages.length > 0
      ? galleryImages
      : [{ id: "fallback", imageId: null, imageUrl: fallbackImageUrl, sortOrder: 0 }];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeSlide = slides[selectedIndex] ?? slides[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted sm:flex-1">
        <Image
          src={activeSlide.imageUrl ?? fallbackImageUrl}
          alt={productName}
          fill
          priority
          sizes="(min-width: 1024px) 480px, 100vw"
          className="object-cover"
        />
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show image ${index + 1} of ${slides.length}`}
              aria-current={index === selectedIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border sm:size-20",
                index === selectedIndex ? "border-primary" : "border-border",
              )}
            >
              <Image src={slide.imageUrl ?? fallbackImageUrl} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Images ordered by `sortOrder` are expected to already arrive sorted from the backend (`docs/integration/storefront/01-products.md`: "images are ordered by sortOrder ascending") — this component does not re-sort. It filters out any gallery entry with a null `imageUrl` and falls back to the product's top-level `imageUrl` when the whole gallery is empty, per `docs/phase-1-catalog.md` task 1.3's "tolerate null gallery URLs with a stable fallback." Thumbnails are plain `<button>` elements, so they are keyboard-focusable and activatable by default with no extra ARIA wiring beyond the label/current state already set.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/products/components/gallery.tsx
git commit -m "feat: add product gallery client island"
```

---

### Task 6: Variant selectors client island

**Files:**
- Create: `features/products/components/variant-selectors.tsx`

**Interfaces:**
- Consumes: `Button` (`components/ui/button.tsx`, existing).
- Produces: `VariantSelectors` component — consumed by Task 9.

- [ ] **Step 1: Write `features/products/components/variant-selectors.tsx`**

```tsx
"use client";

import { useState } from "react";
import { LucideMinus, LucidePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VariantSelectorsProps = {
  sizes: string[];
  colors: string[];
  quantity: number;
};

export function VariantSelectors({ sizes, colors, quantity }: VariantSelectorsProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const isSoldOut = quantity <= 0;

  function decrementQuantity() {
    setSelectedQuantity((current) => Math.max(1, current - 1));
  }

  function incrementQuantity() {
    setSelectedQuantity((current) => Math.min(quantity, current + 1));
  }

  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Color</legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                disabled={isSoldOut}
                onClick={() => setSelectedColor(color)}
                aria-pressed={color === selectedColor}
                className={cn(
                  "rounded-none border px-3 py-1 text-sm transition-colors disabled:opacity-50",
                  color === selectedColor
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                disabled={isSoldOut}
                onClick={() => setSelectedSize(size)}
                aria-pressed={size === selectedSize}
                className={cn(
                  "rounded-none border px-3 py-1 text-sm transition-colors disabled:opacity-50",
                  size === selectedSize
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center border border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSoldOut || selectedQuantity <= 1}
            onClick={decrementQuantity}
            aria-label="Decrease quantity"
          >
            <LucideMinus />
          </Button>
          <span className="w-8 text-center text-sm">{selectedQuantity}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSoldOut || selectedQuantity >= quantity}
            onClick={incrementQuantity}
            aria-label="Increase quantity"
          >
            <LucidePlus />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" disabled className="flex-1">
          {isSoldOut ? "Sold out" : "Add to Cart"}
        </Button>
        <Button type="button" variant="outline" disabled className="flex-1">
          Buy Now
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Cart is coming soon — checkout isn&apos;t available yet.
      </p>
    </div>
  );
}
```

Per `docs/phase-1-catalog.md` task 1.3 ("size/color selectors as local interaction state for Phase 2") and the Out-of-scope note ("Add to cart (Phase 2)"), this component owns only local `useState` — there is no `productId` prop, no Server Action, and no submit handler. The contract has no per-variant (color×size) stock/price/image matrix, so selecting a size/color never changes price, image, or the `quantity` bound — only the product-level advisory `quantity` bounds the stepper.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/products/components/variant-selectors.tsx
git commit -m "feat: add size/color/quantity selectors as local state"
```

---

### Task 7: Reviews list, pagination, and `ReviewsFeature`

**Files:**
- Create: `features/reviews/components/review-list.tsx`
- Create: `features/reviews/components/review-pagination.tsx`
- Create: `features/reviews/index.tsx`

**Interfaces:**
- Consumes: `Review` type, `getProductReviews`, `reviewsSearchParamsCache` (Task 3), `RatingSummary` (Task 4), `EmptyState`, `Button` (existing).
- Produces: default export `ReviewsFeature({ productId, ratingsAverage, ratingsQuantity, searchParams })` — consumed by Task 9.

- [ ] **Step 1: Write `features/reviews/components/review-list.tsx`**

```tsx
import { LucideMessageSquare, LucideStar } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import type { Review } from "@/features/reviews/types/review";

type ReviewListProps = {
  reviews: Review[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<LucideMessageSquare className="size-6 text-muted-foreground" aria-hidden />}
        title="No reviews yet"
        description="Be the first to review this product."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-1 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <LucideStar className="size-4 fill-primary text-primary" aria-hidden />
              {review.ratings}
            </span>
            {review.title && <span className="text-sm text-foreground">{review.title}</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {review.user.name} · {formatDate(review.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
```

An unknown product ID returning an empty paginated result is a normal "No reviews" state per `docs/integration/storefront/03-reviews.md`, not an error — this is the same rendering path as a product with zero reviews.

- [ ] **Step 2: Write `features/reviews/components/review-pagination.tsx`**

```tsx
import Link from "next/link";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/api/http";

type ReviewPaginationProps = {
  meta: PageMeta;
};

export function ReviewPagination({ meta }: ReviewPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {meta.hasPrev ? (
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link href={`?page=${meta.page - 1}&limit=${meta.limit}`} aria-label="Previous page" />}
        >
          <LucideChevronLeft />
        </Button>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Previous page">
          <LucideChevronLeft />
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.totalPages}
      </span>
      {meta.hasNext ? (
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link href={`?page=${meta.page + 1}&limit=${meta.limit}`} aria-label="Next page" />}
        >
          <LucideChevronRight />
        </Button>
      ) : (
        <Button variant="outline" size="icon-sm" disabled aria-label="Next page">
          <LucideChevronRight />
        </Button>
      )}
    </div>
  );
}
```

Numbered links only (no client `useQueryStates`), matching Task 3's documented carve-out. `Button`'s `render` prop (confirmed in `@base-ui/react/button`'s `BaseUIComponentProps`) swaps its rendered element for `Link` while keeping button styling — this is the `base-lyra` polymorphism pattern, not a Radix `asChild` prop. Links echo back `meta.limit` (the backend-confirmed value, not a hardcoded default) so a shareable URL like `?page=1&limit=50` keeps its page size across navigation instead of silently resetting to the parser's default of `20`.

- [ ] **Step 3: Write `features/reviews/index.tsx`**

```tsx
import { RatingSummary } from "@/components/shared/rating-summary";
import { ReviewList } from "@/features/reviews/components/review-list";
import { ReviewPagination } from "@/features/reviews/components/review-pagination";
import { reviewsSearchParamsCache } from "@/features/reviews/hooks/use-reviews-params";
import { getProductReviews } from "@/features/reviews/queries/get-product-reviews";

type ReviewsFeatureProps = {
  productId: string;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ReviewsFeature({
  productId,
  ratingsAverage,
  ratingsQuantity,
  searchParams,
}: ReviewsFeatureProps) {
  const { page, limit } = reviewsSearchParamsCache.parse(searchParams);
  const { reviews, meta } = await getProductReviews(productId, page, limit);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Reviews</h2>
        <RatingSummary ratingsAverage={ratingsAverage} ratingsQuantity={ratingsQuantity} />
      </div>
      <ReviewList reviews={reviews} />
      <ReviewPagination meta={meta} />
    </section>
  );
}
```

The rating recap reuses `ratingsAverage`/`ratingsQuantity` already present on the product response — there is no separate review-summary endpoint (`docs/integration/storefront/03-reviews.md`).

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/reviews/components features/reviews/index.tsx
git commit -m "feat: add ReviewsFeature with paginated review list"
```

---

### Task 8: `RelatedProducts` rail

**Files:**
- Create: `features/products/components/related-products.tsx`

**Interfaces:**
- Consumes: `ProductCard` (Task 4), `ProductSummary` (Task 3).
- Produces: `RelatedProducts` component — consumed by Task 9.

- [ ] **Step 1: Write `features/products/components/related-products.tsx`**

```tsx
import Link from "next/link";

import { ProductCard } from "@/features/products/components/product-card";
import type { ProductSummary } from "@/features/products/types/product";

type RelatedProductsProps = {
  products: ProductSummary[];
  categorySlug: string;
};

export function RelatedProducts({ products, categorySlug }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">You may also like</h2>
        <Link href={`/categories/${categorySlug}`} className="text-sm font-medium text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

Renders nothing (not an empty rail) when there are no other same-category products, per `docs/screens/product-detail.md` §6.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/products/components/related-products.tsx
git commit -m "feat: add related products rail"
```

---

### Task 9: Wire `ProductFeature`, the route, not-found, and metadata (final integration)

**Files:**
- Create: `features/products/index.tsx`
- Create: `app/products/[slug]/page.tsx`
- Create: `app/products/[slug]/not-found.tsx`
- Create: `app/products/[slug]/error.tsx`
- Modify: `next.config.ts` (verify only — no change expected)
- Modify: `docs/phase-1-catalog.md` (tick completed task-1.3/1.4 checkboxes)

**Interfaces:**
- Consumes: everything produced by Tasks 3–8.

- [ ] **Step 1: Write `features/products/index.tsx`**

```tsx
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/features/products/components/breadcrumb";
import { Gallery } from "@/features/products/components/gallery";
import { PriceBlock } from "@/features/products/components/price-block";
import { RelatedProducts } from "@/features/products/components/related-products";
import { StockBadge } from "@/features/products/components/stock-badge";
import { VariantSelectors } from "@/features/products/components/variant-selectors";
import { getProduct } from "@/features/products/queries/get-product";
import { getRelatedProducts } from "@/features/products/queries/get-related-products";
import { RatingSummary } from "@/components/shared/rating-summary";
import ReviewsFeature from "@/features/reviews";

type ProductFeatureProps = {
  slug: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProductFeature({ slug, searchParams }: ProductFeatureProps) {
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category.slug, product.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        category={product.category}
        subCategory={product.subCategories[0]}
        productName={product.name}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery images={product.images} fallbackImageUrl={product.imageUrl} productName={product.name} />

        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{product.name}</h1>
          <RatingSummary ratingsAverage={product.ratingsAverage} ratingsQuantity={product.ratingsQuantity} />
          <PriceBlock
            price={product.price}
            discount={product.discount}
            priceAfterDiscount={product.priceAfterDiscount}
          />
          <StockBadge quantity={product.quantity} />
          <VariantSelectors sizes={product.sizes} colors={product.colors} quantity={product.quantity} />
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold text-foreground">Description</h2>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </section>

      <ReviewsFeature
        productId={product.id}
        ratingsAverage={product.ratingsAverage}
        ratingsQuantity={product.ratingsQuantity}
        searchParams={searchParams}
      />

      <RelatedProducts products={relatedProducts} categorySlug={product.category.slug} />
    </div>
  );
}
```

`StockBadge` was previously only wired into `ProductCard` (Task 4); rendering it here too gives the detail page the same "Sold out" / "Only N left" hint the card already shows, instead of leaving quantities 1–5 with no visible low-stock signal (the disabled Add to Cart placeholder in `VariantSelectors` only communicates quantity `0`).

Calling `notFound()` from this nested Server Component (not the page itself) is documented Next.js behavior — it "terminates rendering of the route segment in which it was thrown," and the segment's `not-found.tsx` (Step 3 below) handles it (verified against `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`).

- [ ] **Step 2: Write `app/products/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";

import { getProduct } from "@/features/products/queries/get-product";
import ProductFeature from "@/features/products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  return <ProductFeature slug={slug} searchParams={resolvedSearchParams} />;
}
```

`getProduct` is wrapped in React's `cache()` (Task 3), so `generateMetadata` and `ProductFeature` calling it with the same `slug` in the same request dedupe to one backend call. Both `params` and `searchParams` are Promises in Next.js 16 and are awaited before use, per `docs/00-architecture.md` ADR-W001.

- [ ] **Step 3: Write `app/products/[slug]/not-found.tsx`**

```tsx
import Link from "next/link";
import { LucideSearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideSearchX className="size-6 text-muted-foreground" aria-hidden />}
        title="Product not found"
        description="This product may have been removed or is no longer available."
        action={<Button render={<Link href="/products" />}>Browse products</Button>}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write `app/products/[slug]/error.tsx`**

```tsx
"use client";

import { LucideRefreshCw, LucideTriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type ProductErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ProductError({ unstable_retry }: ProductErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideTriangleAlert className="size-6 text-muted-foreground" aria-hidden />}
        title="Something went wrong"
        description="We couldn't load this product. This is usually temporary — try again."
        action={
          <Button onClick={() => unstable_retry()}>
            <LucideRefreshCw />
            Try again
          </Button>
        }
      />
    </div>
  );
}
```

`error.tsx` is a route-segment error boundary wrapping `page.tsx` (and therefore `ProductFeature`, `ReviewsFeature`, and `RelatedProducts`) — it catches a thrown `ApiError` from a network failure, `429`, or `5xx` on any of the product/reviews/related-products requests and renders retryable fallback UI instead of falling through to Next's generic framework error screen, per the Phase 1 error matrix. `unstable_retry` is this Next.js version's error-boundary retry API (verified against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`) — it replaces the `reset()` prop from older Next.js versions training data may suggest; error boundaries remain Client Components (`"use client"`) so `unstable_retry` can trigger a re-render of the segment. A thrown `ApiError(404, "RESOURCE_NOT_FOUND")` from `getProduct` is already handled separately by `notFound()` inside `ProductFeature` (Step 1) and never reaches this boundary.

- [ ] **Step 5: Verify `next.config.ts` already allows the product image host**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
```

This file already exists with the correct `remotePatterns` entry — confirm it (no edit needed) rather than adding a second one.

- [ ] **Step 6: Tick the completed checkboxes in `docs/phase-1-catalog.md`**

Under "### 1.3 Product detail and gallery", change all five `- [ ]` items to `- [x]`.
Under "### 1.4 Public reviews — read only", change all three `- [ ]` items to `- [x]`.
Leave every checkbox under 1.1, 1.2, and 1.5 as `- [ ]` — those tasks are not part of this plan.

- [ ] **Step 7: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 8: Manual browser Definition of Done**

Run: `bun dev`, then in a browser (with the `sg-couture-api` backend reachable per `docs/phase-0-foundation.md` prerequisites):

- Visit `/products/<a-real-ACTIVE-product-slug>`. Confirm view-source (or a hard refresh) contains the real product name, description, price, and gallery images in the initial HTML — not a client loading shell.
- Confirm the price block shows the struck-through original price and discount badge only for a discounted product, and shows only `priceAfterDiscount` for a non-discounted one.
- Visit a product with `ratingsAverage: null` (or a brand-new product with no reviews) and confirm "No reviews yet" renders — never zero stars.
- Click through gallery thumbnails; confirm keyboard `Tab`+`Enter`/`Space` also changes the main image.
- Toggle size/color pills and the quantity stepper; confirm the Add to Cart / Buy Now buttons stay visibly disabled throughout.
- Scroll to Reviews; if the product has more than one page of reviews, click "Next"/"Previous" and confirm the URL's `?page=` changes and the list re-renders with different reviews; confirm the browser back button restores the prior page.
- Confirm the "You may also like" rail shows other same-category products (or renders nothing if none exist) and horizontally scrolls at narrow widths.
- Visit `/products/this-slug-does-not-exist` and confirm the custom not-found UI renders (not a generic Next.js 404) with a working "Browse products" link.
- Visit a product with quantity 1–5 and confirm the detail page (not just its `ProductCard`) shows the "Only N left" badge; visit a sold-out product and confirm "Sold out" renders there too.
- Temporarily point `API_URL` at an unreachable host (or stop the backend) and reload `/products/<slug>`; confirm the custom error boundary renders with a working "Try again" button, not Next's default error overlay. Restore `API_URL` afterward.
- Check the page `<head>` (view-source) for a `<title>` matching the product name and an Open Graph image tag.

- [ ] **Step 9: Commit**

```bash
git add features/products/index.tsx app/products docs/phase-1-catalog.md
git commit -m "feat: wire ProductFeature and the /products/[slug] route"
```

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/screens/product-detail.md` (breadcrumb, gallery, info panel, description, reviews, related products) maps to a task above; the sticky-mobile-bar and native-share suggestions from that wireframe are visual/CSS polish, not separate data-flow tasks, and are left to the implementer's Task 9 styling pass rather than a fabricated dedicated task.
- **Type consistency:** `ProductSummary` (Task 3) is the single card-shape type used by `get-related-products.ts`, `product-card.tsx`, and `related-products.tsx` — no divergent `ProductCard`-named type exists, avoiding a name collision with the `ProductCard` component.
- **No placeholders:** every step above contains complete file content or an exact, minimal diff instruction (the one exception — Task 1's shadcn-generated file — states the exact code to insert and where, since the surrounding generated boilerplate is only known once the CLI runs).
