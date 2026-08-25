import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { getCategories } from "@/features/categories/queries/get-categories";
import { AppliedFilters } from "@/features/products/components/applied-filters";
import { ProductsControlsRow } from "@/features/products/components/products-controls-row";
import { ProductsGridSkeleton } from "@/features/products/components/products-grid-skeleton";
import { ProductsResults } from "@/features/products/components/products-results";
import { ProductsTitleBand } from "@/features/products/components/products-title-band";
import {
  toGetProductsParams,
  type ProductsSearchParams,
} from "@/features/products/hooks/products-search-params";
import { getProducts } from "@/features/products/queries/get-products";

type ProductsFeatureProps = {
  searchParams: ProductsSearchParams;
};

export default async function ProductsFeature({ searchParams }: ProductsFeatureProps) {
  const categories = await getCategories();
  /* Started, not awaited: the piece count and the results grid consume the same
     promise from separate Suspense boundaries, so the controls row stays
     interactive while the grid streams and the request is still made once. */
  const productsPromise = getProducts(toGetProductsParams(searchParams));

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-8 sm:px-6 lg:px-8">
      <ProductsTitleBand categories={categories} searchParams={searchParams} />
      <div className="pt-6">
        <ProductsControlsRow
          categories={categories}
          searchParams={searchParams}
          productsPromise={productsPromise}
        />
        <AppliedFilters categories={categories} searchParams={searchParams} />
        <SectionErrorBoundary title="Products">
          <Suspense
            key={JSON.stringify(searchParams)}
            fallback={<ProductsGridSkeleton />}
          >
            <ProductsResults
              searchParams={searchParams}
              productsPromise={productsPromise}
            />
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
