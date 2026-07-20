import { ProductCard } from "@/features/products/components/product-card";
import type { ProductSummary } from "@/features/products/types/product";

type ProductsGridProps = {
  products: ProductSummary[];
};

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
