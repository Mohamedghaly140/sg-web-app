import Link from "next/link";
import { LucideX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/features/categories/types/category";
import {
  buildProductsHref,
  type ProductsSearchParams,
} from "@/features/products/hooks/products-search-params";
import { formatEGPRange } from "@/lib/format";

type AppliedFiltersProps = {
  categories: Category[];
  searchParams: ProductsSearchParams;
};

type AppliedFilter = {
  key: string;
  label: string;
  href: string;
};

function toCsvItems(value: string | null): string[] {
  if (value === null) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function withoutCsvItem(value: string | null, item: string): string | null {
  const remaining = toCsvItems(value).filter(
    (currentItem) => currentItem !== item,
  );
  return remaining.length > 0 ? remaining.join(",") : null;
}

function resolveSubCategoryName(
  categories: Category[],
  slug: string,
): string {
  for (const category of categories) {
    const match = category.subCategories.find(
      (subCategory) => subCategory.slug === slug,
    );
    if (match !== undefined) return match.name;
  }
  return slug;
}

function collectAppliedFilters(
  categories: Category[],
  searchParams: ProductsSearchParams,
): AppliedFilter[] {
  const applied: AppliedFilter[] = [];

  if (searchParams.search !== null) {
    applied.push({
      key: "search",
      label: `“${searchParams.search}”`,
      href: buildProductsHref(searchParams, { search: null }),
    });
  }

  // `category` deliberately has no tag: it is the page's heading, and the phase
  // doc's "Clear all resets to the category default" depends on it surviving.
  if (searchParams.subCategory !== null) {
    applied.push({
      key: "subCategory",
      label: resolveSubCategoryName(categories, searchParams.subCategory),
      href: buildProductsHref(searchParams, { subCategory: null }),
    });
  }

  for (const size of toCsvItems(searchParams.sizes)) {
    applied.push({
      key: `size:${size}`,
      label: size,
      href: buildProductsHref(searchParams, {
        sizes: withoutCsvItem(searchParams.sizes, size),
      }),
    });
  }

  for (const color of toCsvItems(searchParams.colors)) {
    applied.push({
      key: `color:${color}`,
      label: color,
      href: buildProductsHref(searchParams, {
        colors: withoutCsvItem(searchParams.colors, color),
      }),
    });
  }

  // Min and max are one filter to the shopper, so they clear together.
  if (searchParams.minPrice !== null || searchParams.maxPrice !== null) {
    applied.push({
      key: "price",
      label: formatEGPRange(searchParams.minPrice, searchParams.maxPrice),
      href: buildProductsHref(searchParams, {
        minPrice: null,
        maxPrice: null,
      }),
    });
  }

  // The drawer has no Featured control -- the design has none -- so this tag is
  // the only way out of a `?featured=true` link arriving from the home bands.
  if (searchParams.featured !== null) {
    applied.push({
      key: "featured",
      label: "Featured",
      href: buildProductsHref(searchParams, { featured: null }),
    });
  }

  return applied;
}

export function AppliedFilters({
  categories,
  searchParams,
}: AppliedFiltersProps) {
  const applied = collectAppliedFilters(categories, searchParams);

  if (applied.length === 0) {
    return null;
  }

  const clearAllHref = buildProductsHref(searchParams, {
    search: null,
    subCategory: null,
    sizes: null,
    colors: null,
    minPrice: null,
    maxPrice: null,
    featured: null,
    sort: "newest",
  });

  return (
    /* Below `sm` the tags scroll as one line instead of wrapping into three
       (Phase 13 §13.5). `-mx-4 px-4` bleeds the scroller through the feature's
       own `px-4` so tags run edge to edge. `overflow-x-auto` also makes
       overflow-y compute to `auto`, so a focused tag would be clipped by the
       scroll box -- the row's existing `py-3` (13.8px) already clears the
       global 2px outline at a 2px offset, which is why this needs no vertical
       inset of its own, unlike the account sub-nav's `gap-1` tab row. The
       bleed is dropped at `sm`, where the row wraps as designed. */
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0">
      <span className="text-eyebrow shrink-0">Applied</span>
      {applied.map((filter) => (
        <Badge
          key={filter.key}
          variant="outline"
          className="shrink-0 pointer-coarse:min-h-10 pointer-coarse:px-4"
          render={
            <Link href={filter.href} aria-label={`Remove filter: ${filter.label}`} />
          }
        >
          {filter.label}
          <LucideX aria-hidden />
        </Badge>
      ))}
      <Link
        href={clearAllHref}
        className="ml-2 inline-flex shrink-0 items-center text-[11.5px] text-accent-strong underline-offset-3 hover:underline pointer-coarse:min-h-10"
      >
        Clear all
      </Link>
    </div>
  );
}
