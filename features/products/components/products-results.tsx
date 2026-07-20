import { LucideShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductsGrid } from "@/features/products/components/products-grid";
import {
  buildProductsHref,
  ProductsPagination,
} from "@/features/products/components/products-pagination";
import {
  toGetProductsParams,
  type ProductsSearchParams,
} from "@/features/products/hooks/products-search-params";
import { getProducts } from "@/features/products/queries/get-products";
import { redirectToLastPageIfOutOfRange } from "@/lib/pagination";

type ProductsResultsProps = {
  searchParams: ProductsSearchParams;
};

export async function ProductsResults({ searchParams }: ProductsResultsProps) {
  const { data: products, meta } = await getProducts(
    toGetProductsParams(searchParams),
  );

  redirectToLastPageIfOutOfRange(meta, (page) =>
    buildProductsHref(searchParams, page),
  );

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
