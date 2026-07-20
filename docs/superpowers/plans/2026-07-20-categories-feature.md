# Categories Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/categories` (a responsive server-rendered category grid) and `/categories/[slug]` (a thin landing page over `CategoryFeature` showing category context plus its product listing) per `docs/phase-1-catalog.md` §1.1, reusing the category types/queries/tile that already exist from the Home plan and extending `getProducts` with the one product-listing filter this task needs.

**Architecture:** A single `features/categories/` directory (matching the domain-plural convention already used for `features/products/`) holds everything. `features/categories/index.tsx` default-exports `CategoryFeature` — the **detail** page's Server Component — mirroring the precedent already committed in `docs/superpowers/plans/2026-07-19-product-detail.md` (Task 9), where `features/products/index.tsx` default-exports `ProductFeature` (also the detail page, not the list). The **list** page's composition, `CategoriesFeature`, is a named export from `features/categories/components/categories-feature.tsx`. This is a deliberate, documented deviation from the "one default `<Name>Feature` per index.tsx" convention for domains needing two top-level route compositions instead of one.

`CategoryFeature` awaits `getCategory(slug)` directly (not inside `<Suspense>`) because its result gates `notFound()`. The category's product listing is a separate, independently-Suspended `<CategoryProducts>` section wrapped in the existing `SectionErrorBoundary`, so a products-endpoint failure leaves the category header/subcategories visible with just that section showing a retry button — the same isolation pattern Home already established for its rails.

**Tech Stack:** Next.js 16 App Router (Server Components, `notFound()`, `generateMetadata`, `unstable_catchError`), TypeScript, Tailwind v4, shadcn `base-lyra` on `@base-ui/react`, Bun.

## Context

### What already exists (do not recreate)

- `features/categories/types/category.ts` — `Category { id, name, slug, imageUrl: string | null, productCount, subCategories: SubCategory[] }`, `SubCategory { id, name, slug, productCount }`. Already matches `docs/integration/storefront/02-categories.md` field-for-field. Task 1 verifies this in place; no edit.
- `features/categories/queries/get-categories.ts` — `getCategories(): Promise<Category[]>`. Unchanged by this plan.
- `features/categories/components/category-tile.tsx` — the compact image+name tile for Home's "Shop by Category" rail. Untouched; Home still needs it. This plan adds a **new sibling** component (`CategoryCard`, Task 3) for the fuller `/categories` grid.
- `features/products/types/product.ts`, `features/products/components/product-card.tsx` (imports `DiscountBadge`/`StockBadge`/`RatingSummary`, links to `/products/${slug}`, fixed `w-[75vw] shrink-0 sm:w-56` width), `stock-badge.tsx`, `discount-badge.tsx`, `components/shared/rating-summary.tsx` — all exist and are reused as-is.
- `lib/api/http.ts` — real signature: `apiFetch<T = undefined>(path, options): Promise<T>`, `Paginated<TItem> = { data: TItem[]; meta: PageMeta }` (field is `data`, not `items`). `lib/api/api-error.ts` exports `ApiError(status, code: ErrorCode, message, errors?)` where `ErrorCode` includes `"RESOURCE_NOT_FOUND"`.
- `features/products/queries/get-products.ts` — `getProducts(params?): Promise<Paginated<ProductSummary>>`, `GetProductsParams = { featured?, sort?, limit?, page? }`. No `category` param yet — Task 2 adds exactly one (`category?: string`, slug-based, per `docs/integration/storefront/01-products.md`).
- `components/ui/badge.tsx` (variants: `default`, `secondary`, `destructive`, `success`, `warning`, `info`, `outline`, `ghost`, `link` — base-lyra `useRender`/`render`-prop polymorphism), `components/ui/skeleton.tsx`, `components/ui/button.tsx` (base-ui `ButtonPrimitive`, supports `render` prop).
- `components/shared/empty-state/index.tsx` — `EmptyState({ icon, title, description?, action? })`.
- `components/shared/section-error-boundary.tsx` — `unstable_catchError`-based `SectionErrorBoundary({ title, children })`, `(props, { unstable_retry })` fallback signature. Already used by Home.
- `app/layout.tsx` already renders `<Header />`/`<Footer />` around `{children}` — nothing in this plan touches the shared shell.
- `next.config.ts` already allows `res.cloudinary.com` in `images.remotePatterns` — no edit needed.
- `docs/README.md`'s Phase 1 row is already "in progress" — no edit needed.
- No `docs/screens/categories.md` wireframe exists; layout is designed directly in the component tasks below.

### Architecture decision: resolving the plural/singular Feature split

`docs/superpowers/plans/2026-07-19-product-detail.md` (Task 9, `export default async function ProductFeature(...)` in `features/products/index.tsx`, imported in `app/products/[slug]/page.tsx` as `import ProductFeature from "@/features/products"`) is the authoritative, already-written precedent for this exact structural problem on the sibling `products` domain. It puts the **detail** Feature at the plural directory's default export, not a singular sibling directory. This plan mirrors it exactly: `features/categories/index.tsx` → `CategoryFeature` (detail), `features/categories/components/categories-feature.tsx` → named export `CategoriesFeature` (list).

## Global Constraints

- Bun only — never `npm`/`npx`/`yarn`. Run `bunx tsc --noEmit` and `bun lint` after every task; both must be clean before committing.
- No automated test suite exists. Each task's verification is `bunx tsc --noEmit` + `bun lint`; the final task carries the full browser Definition of Done.
- Every query in this plan uses `auth: "public"` — no Clerk token, no cart session.
- Branch on `ApiError.code`, never `.message`. `getCategory` catches only `"RESOURCE_NOT_FOUND"`; every other code rethrows and is handled by the route's `error.tsx`.
- Badge styling uses only the semantic variants already on `Badge` (`secondary` here) — never literal color classes.
- Lucide icons import with the `Lucide` prefix.
- Component prop types are named `<ComponentName>Props`; files are kebab-case.
- `app/` pages stay thin; all logic lives in `features/categories/`.
- Every product card in this plan reuses the existing `ProductCard` — no reinvented card markup.
- Links use `slug`, never `id`.
- `git commit` messages must **not** include a `Co-Authored-By` or any AI-attribution trailer, per this repo's `AGENTS.md`.

## Implementation Phases

| Phase | Tasks | Delivers | Depends on |
|---|---|---|---|
| 1 — Data layer | 1–2 | `getCategory` query (`cache()`-wrapped); `category` filter added to `getProducts` | none |
| 2 — Shared presentational components | 3–4 | `CategoryCard` (list grid card); `CategoryProducts` + skeleton (detail page's product rail) | Phase 1 (Task 4 needs Task 2) |
| 3 — Routes and final integration | 5–7 | `CategoriesFeature`/`/categories`; `CategoryFeature`/`/categories/[slug]` with `generateMetadata` and `notFound()`; catalog checklist tick + full browser DoD | Phase 2 |

Verification per phase:
- **Phase 1:** `bunx tsc --noEmit && bun lint` clean — no browser check yet.
- **Phase 2:** same — components exist but aren't imported by any route yet.
- **Phase 3:** the full manual browser Definition of Done in Task 7 Step 4.

---

## Phase 1 — Data Layer

### Task 1: Verify category types and add `get-category.ts`

**Files:**
- Verify (no change): `features/categories/types/category.ts`
- Create: `features/categories/queries/get-category.ts`

**Interfaces:**
- Consumes: `apiFetch`, `ApiError` (existing, `lib/api/`).
- Produces: `getCategory(slug): Promise<Category | null>` — consumed by Task 6.

- [ ] **Step 1: Verify `features/categories/types/category.ts` needs no change**

Open the file and confirm it reads exactly:

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

Compare against `docs/integration/storefront/02-categories.md`'s example response — it matches exactly. Do not edit this file.

- [ ] **Step 2: Write `features/categories/queries/get-category.ts`**

```ts
import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";
import type { Category } from "@/features/categories/types/category";

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  try {
    return await apiFetch<Category>(`/categories/${encodeURIComponent(slug)}`, {
      auth: "public",
      next: { revalidate: 300, tags: [`category:${slug}`] },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return null;
    }
    throw error;
  }
});
```

Wrapped in React's `cache()` so `generateMetadata` (Task 6) and `CategoryFeature`'s body both call `getCategory(slug)` in the same render and dedupe to one backend request. Catching only `RESOURCE_NOT_FOUND` and converting it to `null` (the caller calls `notFound()`) mirrors the sibling `getProduct` pattern in the unexecuted product-detail plan.

- [ ] **Step 3: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add features/categories/queries/get-category.ts
git commit -m "feat: add cached getCategory query"
```

---

### Task 2: Add the `category` filter to `getProducts`

**Files:**
- Modify: `features/products/queries/get-products.ts`

**Interfaces:**
- Produces: `GetProductsParams.category?: string` — consumed by Task 4.

- [ ] **Step 1: Rewrite `features/products/queries/get-products.ts`**

```ts
import "server-only";

import { apiFetch, type Paginated } from "@/lib/api/http";
import type { ProductSummary } from "@/features/products/types/product";

export type ProductsSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "best_selling"
  | "top_rated";

export type GetProductsParams = {
  category?: string;
  featured?: boolean;
  sort?: ProductsSortOption;
  limit?: number;
  page?: number;
};

export async function getProducts(
  params: GetProductsParams = {},
): Promise<Paginated<ProductSummary>> {
  const searchParams = new URLSearchParams();

  if (params.category !== undefined) {
    searchParams.set("category", params.category);
  }
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

  return apiFetch<Paginated<ProductSummary>>(
    `/products${query ? `?${query}` : ""}`,
    {
      auth: "public",
      next: { revalidate: 120, tags: ["products"] },
    },
  );
}
```

Only two additions vs. the current file: `category?: string` on `GetProductsParams`, and its three-line `URLSearchParams` block. `category` takes a category **slug**, per `docs/integration/storefront/01-products.md`. No `subCategory`/`sizes`/`colors`/`minPrice`/`maxPrice`/`search` — those belong to Phase 1.2. Purely additive: existing call sites (`features/home/components/product-section.tsx`) omit `category` and are unaffected.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/products/queries/get-products.ts
git commit -m "feat: add category slug filter to getProducts"
```

---

## Phase 2 — Shared Presentational Components

Nothing in this phase is routed yet.

### Task 3: `CategoryCard` (list-grid card)

**Files:**
- Create: `features/categories/components/category-card.tsx`

**Interfaces:**
- Consumes: `Category` (Task 1), `Badge` (existing).
- Produces: `CategoryCard` — consumed by Task 5.

- [ ] **Step 1: Write `features/categories/components/category-card.tsx`**

```tsx
import { LucideImage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/features/categories/types/category";

const MAX_VISIBLE_SUBCATEGORIES = 3;

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const visibleSubCategories = category.subCategories.slice(0, MAX_VISIBLE_SUBCATEGORIES);
  const hiddenSubCategoryCount = category.subCategories.length - visibleSubCategories.length;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <Link href={`/categories/${category.slug}`} className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LucideImage className="size-8 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground">{category.name}</p>
          <Badge variant="secondary">
            {category.productCount} {category.productCount === 1 ? "item" : "items"}
          </Badge>
        </div>
      </Link>
      {visibleSubCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSubCategories.map((subCategory) => (
            <Link
              key={subCategory.id}
              href={`/products?category=${category.slug}&subCategory=${subCategory.slug}`}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {subCategory.name}
            </Link>
          ))}
          {hiddenSubCategoryCount > 0 && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              +{hiddenSubCategoryCount} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

Deliberately a sibling of `CategoryTile`, not a superset built by editing it. The outer `<div>` is not itself a link (only the image/name block and each sub-category chip are `<Link>`s), so there are no nested `<a>` tags. Sub-category chips link to `/products?category=<slug>&subCategory=<slug>` — that route 404s until Phase 1.2, which is expected and temporary, identical in spirit to Home's forward links to `/products`.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add features/categories/components/category-card.tsx
git commit -m "feat: add CategoryCard for the categories grid"
```

---

### Task 4: `CategoryProducts` and its skeleton (detail page's product rail)

**Files:**
- Create: `features/categories/components/category-products.tsx`
- Create: `features/categories/components/category-products-skeleton.tsx`

**Interfaces:**
- Consumes: `getProducts` (Task 2), `ProductCard` (existing), `EmptyState` (existing), `Skeleton` (existing).
- Produces: `CategoryProducts({ categorySlug })`, `CategoryProductsSkeleton` — consumed by Task 6.

- [ ] **Step 1: Write `features/categories/components/category-products.tsx`**

```tsx
import { LucideShoppingBag } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/features/products/components/product-card";
import { getProducts } from "@/features/products/queries/get-products";

const CATEGORY_PRODUCTS_LIMIT = 12;

type CategoryProductsProps = {
  categorySlug: string;
};

export async function CategoryProducts({ categorySlug }: CategoryProductsProps) {
  const { data: products } = await getProducts({
    category: categorySlug,
    limit: CATEGORY_PRODUCTS_LIMIT,
  });

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6 text-muted-foreground" aria-hidden />}
        title="No products yet"
        description="Check back soon for new arrivals in this category."
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Products</h2>
        <Link
          href={`/products?category=${categorySlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </div>
      <div
        tabIndex={0}
        className="flex snap-x gap-4 overflow-x-auto pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

Renders a horizontal-scroll rail (same shape as Home's `ProductSection`), not a CSS grid, because `ProductCard` is a fixed-width, `shrink-0` card by design. Unlike Home's supplementary rails, a category landing page's product listing is the primary reason a visitor is here, so an empty result shows an explicit `EmptyState`. `data: products` matches the real `Paginated<TItem> = { data, meta }` shape. A full paginated grid with filters is Phase 1.2's job — this is a context rail, not the full product listing feature.

- [ ] **Step 2: Write `features/categories/components/category-products-skeleton.tsx`**

```tsx
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARD_COUNT = 4;

export function CategoryProductsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Products</h2>
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
git add features/categories/components/category-products.tsx features/categories/components/category-products-skeleton.tsx
git commit -m "feat: add CategoryProducts rail and its loading skeleton"
```

---

## Phase 3 — Routes and Final Integration

### Task 5: `CategoriesFeature` and the `/categories` route

**Files:**
- Create: `features/categories/components/categories-feature.tsx`
- Create: `app/categories/page.tsx`
- Create: `app/categories/error.tsx`

**Interfaces:**
- Consumes: `getCategories` (existing), `CategoryCard` (Task 3), `EmptyState` (existing).
- Produces: named export `CategoriesFeature` — consumed by `app/categories/page.tsx`.

- [ ] **Step 1: Write `features/categories/components/categories-feature.tsx`**

```tsx
import { LucideLayoutGrid } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { CategoryCard } from "@/features/categories/components/category-card";
import { getCategories } from "@/features/categories/queries/get-categories";

export async function CategoriesFeature() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<LucideLayoutGrid className="size-6 text-muted-foreground" aria-hidden />}
          title="No categories yet"
          description="Check back soon — new categories are on the way."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
```

A named export, not `index.tsx`'s default — see "Architecture decision" above. Single content section, so no `SectionErrorBoundary`/`Suspense` here; a thrown `ApiError` bubbles to `app/categories/error.tsx` (Step 3).

- [ ] **Step 2: Write `app/categories/page.tsx`**

```tsx
import type { Metadata } from "next";

import { CategoriesFeature } from "@/features/categories/components/categories-feature";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all SG Couture categories.",
};

export default function CategoriesPage() {
  return <CategoriesFeature />;
}
```

Static `metadata` is correct here — dynamic metadata is only required for the detail page (Task 6).

- [ ] **Step 3: Write `app/categories/error.tsx`**

```tsx
"use client";

import { LucideRefreshCw, LucideTriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type CategoriesErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function CategoriesError({ unstable_retry }: CategoriesErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideTriangleAlert className="size-6 text-muted-foreground" aria-hidden />}
        title="Something went wrong"
        description="We couldn't load categories. This is usually temporary — try again."
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

`{ error, unstable_retry }` is Next.js 16's real `error.js` prop shape (verified in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`) — `unstable_retry()` re-fetches and re-renders the segment, replacing the older `reset()` prop.

- [ ] **Step 4: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add features/categories/components/categories-feature.tsx app/categories/page.tsx app/categories/error.tsx
git commit -m "feat: wire CategoriesFeature and the /categories route"
```

---

### Task 6: `CategoryFeature` and the `/categories/[slug]` route

**Files:**
- Create: `features/categories/index.tsx`
- Create: `app/categories/[slug]/page.tsx`
- Create: `app/categories/[slug]/not-found.tsx`
- Create: `app/categories/[slug]/error.tsx`

**Interfaces:**
- Consumes: `getCategory` (Task 1), `CategoryProducts`/`CategoryProductsSkeleton` (Task 4), `SectionErrorBoundary` (existing).
- Produces: default export `CategoryFeature` — consumed by `app/categories/[slug]/page.tsx`.

- [ ] **Step 1: Write `features/categories/index.tsx`**

```tsx
import { LucideImage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { Badge } from "@/components/ui/badge";
import { CategoryProducts } from "@/features/categories/components/category-products";
import { CategoryProductsSkeleton } from "@/features/categories/components/category-products-skeleton";
import { getCategory } from "@/features/categories/queries/get-category";

type CategoryFeatureProps = {
  slug: string;
};

export default async function CategoryFeature({ slug }: CategoryFeatureProps) {
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← All categories
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted sm:aspect-square sm:w-48 sm:shrink-0">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(min-width: 640px) 192px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LucideImage className="size-8 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{category.name}</h1>
          <Badge variant="secondary">
            {category.productCount} {category.productCount === 1 ? "item" : "items"}
          </Badge>
          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {category.subCategories.map((subCategory) => (
                <Link
                  key={subCategory.id}
                  href={`/products?category=${category.slug}&subCategory=${subCategory.slug}`}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {subCategory.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <SectionErrorBoundary title="Products">
        <Suspense fallback={<CategoryProductsSkeleton />}>
          <CategoryProducts categorySlug={category.slug} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
```

Calling `notFound()` from this nested Server Component (not `page.tsx` itself) terminates rendering of the route segment; the segment's `not-found.tsx` (Step 3) handles it. `getCategory` is awaited directly (not inside `<Suspense>`) because its result gates both `notFound()` and the rest of the page; `CategoryProducts` gets its own `<Suspense>` + `SectionErrorBoundary` so a products-endpoint failure doesn't take out the already-resolved category header.

- [ ] **Step 2: Write `app/categories/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";

import CategoryFeature from "@/features/categories";
import { getCategory } from "@/features/categories/queries/get-category";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description: `Shop the ${category.name} collection at SG Couture.`,
    openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;

  return <CategoryFeature slug={slug} />;
}
```

`params` is a Promise in Next.js 16 and is awaited before use. `getCategory` is `cache()`-wrapped (Task 1), so this call and `CategoryFeature`'s internal call with the same `slug` dedupe to one backend request in the same render. The `if (!category)` branch degrades metadata to a generic title instead of throwing during head resolution; the visible page body still gets the real, branded 404 (Step 3) via `CategoryFeature`'s own `notFound()` call. `openGraph` is only set when `imageUrl` is non-null — never a fabricated image URL.

- [ ] **Step 3: Write `app/categories/[slug]/not-found.tsx`**

```tsx
import { LucideSearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideSearchX className="size-6 text-muted-foreground" aria-hidden />}
        title="Category not found"
        description="This category may have been removed or renamed."
        action={<Button render={<Link href="/categories" />}>Browse categories</Button>}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write `app/categories/[slug]/error.tsx`**

```tsx
"use client";

import { LucideRefreshCw, LucideTriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type CategoryErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function CategoryError({ unstable_retry }: CategoryErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideTriangleAlert className="size-6 text-muted-foreground" aria-hidden />}
        title="Something went wrong"
        description="We couldn't load this category. This is usually temporary — try again."
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

This catches a non-`RESOURCE_NOT_FOUND` `ApiError` (network failure, 429, 5xx) thrown by `getCategory` before `CategoryFeature` can render anything — distinct from `CategoryProducts`' own `SectionErrorBoundary`, which only covers the products rail once the category header has already rendered.

- [ ] **Step 5: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add features/categories/index.tsx app/categories/[slug]
git commit -m "feat: wire CategoryFeature and the /categories/[slug] route"
```

---

### Task 7: Tick the catalog checklist and final integration

**Files:**
- Modify: `docs/phase-1-catalog.md` (tick §1.1 checkboxes)

- [ ] **Step 1: Tick the completed checkboxes in `docs/phase-1-catalog.md`**

Under "### 1.1 Categories feature", change all five `- [ ]` items to `- [x]`:

```markdown
- [x] Create hand-written category and sub-category response types from `02-categories.md`; preserve nullable `imageUrl`, the unpaginated tree, ACTIVE-product counts, and slug fields.
- [x] Add thin `features/categories/queries/get-categories.ts` and `get-category.ts` functions that call Public `apiFetch`, use `next: { revalidate: 300, tags }`, and contain no business rules. Use React `cache()` where the page and metadata need the same request result.
- [x] Implement `CategoriesFeature` for `/categories`: a responsive, server-rendered category tree with optimized images, `productCount` hints, nested sub-categories, empty/error states, and links using category/sub-category slugs rather than IDs.
- [x] Implement the `/categories/[slug]` landing page as a thin page over `CategoryFeature`. Await the Next 16 `params` Promise, render category context plus its product listing, and use `notFound()` only for `RESOURCE_NOT_FOUND`.
- [x] Add `generateMetadata` for category detail using live name/image data, with a safe unavailable fallback and no duplicate client request.
```

Leave 1.2, 1.3, and 1.4 as `- [ ]` — not part of this plan. `docs/README.md`'s Phase 1 status is already "in progress" and needs no edit.

- [ ] **Step 2: Type-check and lint**

Run: `bunx tsc --noEmit && bun lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add docs/phase-1-catalog.md
git commit -m "docs: tick Phase 1.1 categories feature checklist"
```

- [ ] **Step 4: Manual browser Definition of Done**

Run: `bun dev`, then in a browser (with the `sg-couture-api` backend reachable):

- Visit `/categories`. Confirm view-source (or a hard refresh) shows every category's name, image, and `productCount` badge in the initial HTML — not a client loading shell.
- Confirm a category with `subCategories.length > 3` shows exactly 3 chips plus a "+N more" chip; confirm one with 1–3 shows all with no "+N more"; confirm one with 0 shows no chip row.
- Confirm a category with `imageUrl: null` renders the muted `LucideImage` fallback tile, not a broken image.
- Click a category card's image/name — confirm it navigates to `/categories/<slug>`; click a sub-category chip — confirm it navigates to `/products?category=<slug>&subCategory=<subSlug>` (expected to 404 until Phase 1.2).
- On `/categories/<slug>`: confirm view-source shows the real category name, image, sub-category chips, and the first page of that category's products in the initial HTML.
- Confirm the product rail reuses `ProductCard` exactly — struck-through original price and badges only on discounted/low-stock/sold-out products, "No reviews yet" for a null rating, and the rail's "View all" link points to `/products?category=<slug>`.
- Visit a category with zero ACTIVE products and confirm the "No products yet" `EmptyState` renders instead of an empty rail.
- Visit `/categories/this-slug-does-not-exist` and confirm the custom "Category not found" UI renders (not the generic global 404) with a working "Browse categories" link.
- Check the page `<head>` (view-source) on `/categories/<slug>` for a `<title>` matching the category name and, when the category has an image, an Open Graph image tag; visit an unknown slug and confirm the title falls back to "Category not found" without throwing.
- Temporarily point `API_URL` at an unreachable host (or stop the backend) and reload `/categories`; confirm the branded "Something went wrong" UI renders with a working "Try again" button. Restore `API_URL` and repeat for `/categories/<slug>`.
- At a narrow viewport: confirm the `/categories` grid wraps to 2–3 columns with no horizontal scroll; confirm `/categories/<slug>`'s header stacks the image above the text and the product rail stays a horizontal-scroll rail with a visible peek of the next card, scrollable by touch and by arrow keys once focused.

---

## Self-Review Notes

- **Spec coverage:** all five `docs/phase-1-catalog.md` §1.1 items map to Tasks 1, 1, 5, 6, 6 respectively.
- **Type consistency:** `Category`/`SubCategory` (unchanged) is the single type used by `getCategories`, `getCategory`, `CategoryTile`, `CategoryCard`, `CategoryFeature`. `ProductSummary`/`Paginated<T>` (unchanged) is the single type used by `getProducts` and every `ProductCard` consumer.
- **No placeholders:** every step contains complete file content or an exact, minimal diff.
- **Precedent alignment:** `getCategory`/`CategoryFeature`/`notFound()`/`generateMetadata`/`not-found.tsx`/`error.tsx` mirror the equivalent, already-designed `getProduct`/`ProductFeature` pieces in the unexecuted product-detail plan where the domains are structurally identical.

### Critical Files for Implementation
- `features/categories/queries/get-category.ts`
- `features/categories/index.tsx`
- `features/categories/components/categories-feature.tsx`
- `features/products/queries/get-products.ts`
- `docs/superpowers/plans/2026-07-19-product-detail.md` (precedent reference)
