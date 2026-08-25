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
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-eyebrow">Applied</span>
      {applied.map((filter) => (
        <Badge
          key={filter.key}
          variant="outline"
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
        className="ml-2 text-[11.5px] text-accent-strong underline-offset-3 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
