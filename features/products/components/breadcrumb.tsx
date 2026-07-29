import { LucideChevronLeft } from "lucide-react";
import Link from "next/link";

import type { ProductCategoryRef } from "@/features/products/types/product";

type BreadcrumbProps = {
  category: ProductCategoryRef;
  subCategory: ProductCategoryRef | undefined;
  productName: string;
};

export function Breadcrumb({
  category,
  subCategory,
  productName,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      {/* Narrow width collapses to a single back link (docs/screens/product-detail.md). */}
      <Link
        href={`/categories/${category.slug}`}
        className="inline-flex items-center gap-1 transition-colors hover:text-foreground sm:hidden"
      >
        <LucideChevronLeft className="size-4" aria-hidden />
        {category.name}
      </Link>

      <ol className="hidden flex-wrap items-center gap-2 sm:flex">
        <li>
          <Link
            href={`/categories/${category.slug}`}
            className="transition-colors hover:text-foreground"
          >
            {category.name}
          </Link>
        </li>
        {subCategory && (
          <>
            <li aria-hidden="true">/</li>
            <li>
              {/* The /categories/[slug] page ignores search params, so the
                  subcategory crumb points at the filtered catalog listing. */}
              <Link
                href={`/products?category=${category.slug}&subCategory=${subCategory.slug}`}
                className="transition-colors hover:text-foreground"
              >
                {subCategory.name}
              </Link>
            </li>
          </>
        )}
        <li aria-hidden="true">/</li>
        <li className="text-foreground" aria-current="page">
          {productName}
        </li>
      </ol>
    </nav>
  );
}
