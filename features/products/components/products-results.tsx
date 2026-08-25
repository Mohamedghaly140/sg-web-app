import { LucideShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { ProductsPagination } from "@/features/products/components/products-pagination";
import {
  buildProductsHref,
  type ProductsSearchParams,
} from "@/features/products/hooks/products-search-params";
import type { ProductSummary } from "@/features/products/types/product";
import type { Paginated } from "@/lib/api/http";
import { redirectToLastPageIfOutOfRange } from "@/lib/pagination";

type ProductsResultsProps = {
  searchParams: ProductsSearchParams;
  /* The promise is created once by the feature and shared with the piece count,
     so the two Suspense boundaries stream from a single request. */
  productsPromise: Promise<Paginated<ProductSummary>>;
};

export async function ProductsResults({
  searchParams,
  productsPromise,
}: ProductsResultsProps) {
  const { data: products, meta } = await productsPromise;

  redirectToLastPageIfOutOfRange(meta, (page) =>
    buildProductsHref(searchParams, { page }),
  );

  // The controls row and applied-filter tags now render above this component,
  // so an empty result keeps its filters reachable instead of stranding the
  // shopper on a dead end.
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6 text-muted-foreground" aria-hidden />}
        title="No products match your filters"
        description="Try adjusting or clearing your filters."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ProductsGrid products={products} />
      <ProductsPagination searchParams={searchParams} meta={meta} />
    </div>
  );
}
