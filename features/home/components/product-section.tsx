import { LucideShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { BandHeader } from "@/features/home/components/band-header";
import { ProductCard } from "@/features/products/components/product-card";
import {
  getProducts,
  type GetProductsParams,
} from "@/features/products/queries/get-products";

type ProductSectionProps = {
  title: string;
  viewAllHref: string;
  queryParams: GetProductsParams;
};

export async function ProductSection({
  title,
  viewAllHref,
  queryParams,
}: ProductSectionProps) {
  const { data: products } = await getProducts(queryParams);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6 text-muted-foreground" aria-hidden />}
        title="No products yet"
        description="Check back soon for new arrivals."
      />
    );
  }

  return (
    <section>
      <BandHeader
        title={title}
        linkHref={viewAllHref}
        linkLabel="See all"
      />
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
