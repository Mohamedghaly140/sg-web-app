import type { Category } from "@/features/categories/types/category";
import { ProductsCount } from "@/features/products/components/products-count";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { ProductsSort } from "@/features/products/components/products-sort";
import type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";
import type { ProductSummary } from "@/features/products/types/product";
import type { Paginated } from "@/lib/api/http";

type ProductsControlsRowProps = {
  categories: Category[];
  searchParams: ProductsSearchParams;
  productsPromise: Promise<Paginated<ProductSummary>>;
};

export function ProductsControlsRow({
  categories,
  searchParams,
  productsPromise,
}: ProductsControlsRowProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3">
      <div className="flex items-center gap-3">
        <ProductsFilters
          categories={categories}
          appliedCountPromise={productsPromise.then(
            (result) => result.meta.totalItems,
          )}
        />
        <ProductsCount
          categories={categories}
          searchParams={searchParams}
          productsPromise={productsPromise}
        />
      </div>
      <ProductsSort />
    </div>
  );
}
