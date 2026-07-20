import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { getCategories } from "@/features/categories/queries/get-categories";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { ProductsGridSkeleton } from "@/features/products/components/products-grid-skeleton";
import { ProductsResults } from "@/features/products/components/products-results";
import type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";

type ProductsFeatureProps = {
  searchParams: ProductsSearchParams;
};

export default async function ProductsFeature({ searchParams }: ProductsFeatureProps) {
  const categories = await getCategories();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Shop
      </h1>
      <ProductsFilters categories={categories} />
      <SectionErrorBoundary title="Products">
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ProductsGridSkeleton />}
        >
          <ProductsResults searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
