import { Suspense } from "react";

import { HideOnError } from "@/components/shared/hide-on-error";
import type { Category } from "@/features/categories/types/category";
import type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";
import type { ProductSummary } from "@/features/products/types/product";
import type { Paginated } from "@/lib/api/http";

type ProductsCountProps = {
  categories: Category[];
  searchParams: ProductsSearchParams;
  productsPromise: Promise<Paginated<ProductSummary>>;
};

type ProductsCountValueProps = ProductsCountProps;

/* "N of M pieces": N is the filtered total, M is the size of the pool being
   filtered. Both are already in hand -- N from the listing's own `meta`, M from
   `getCategories()`, which the feature awaits and which is cached for 300s --
   so the count costs no extra request. */
async function ProductsCountValue({
  categories,
  searchParams,
  productsPromise,
}: ProductsCountValueProps) {
  const { meta } = await productsPromise;
  const selectedCategory = categories.find(
    (category) => category.slug === searchParams.category,
  );
  const poolTotal =
    selectedCategory?.productCount ??
    categories.reduce((total, category) => total + category.productCount, 0);

  return (
    <span className="figures text-[12.5px] text-muted-foreground">
      {meta.totalItems} of {poolTotal} pieces
    </span>
  );
}

/* The count shares its promise with the results grid. When that fetch fails the
   grid already shows SectionErrorBoundary's "unavailable right now" card, so
   this inline count must fail silently rather than raise a second, redundant
   error surface -- or, without a boundary of its own, crash the whole page.

   The Filter trigger and the applied-filter tags sit outside every boundary on
   purpose: they derive from the URL alone, so filtering stays usable even when
   the catalogue request is failing. */
export function ProductsCount(props: ProductsCountProps) {
  return (
    <HideOnError>
      <Suspense fallback={null}>
        <ProductsCountValue {...props} />
      </Suspense>
    </HideOnError>
  );
}
