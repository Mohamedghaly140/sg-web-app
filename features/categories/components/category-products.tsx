import { LucideShoppingBag } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/features/products/components/product-card";
import { getProducts } from "@/features/products/queries/get-products";

const CATEGORY_PRODUCTS_LIMIT = 12;

type CategoryProductsProps = {
  categorySlug: string;
};

export async function CategoryProducts({ categorySlug }: CategoryProductsProps) {
  const { data: products } = await getProducts({
    category: categorySlug,
    limit: CATEGORY_PRODUCTS_LIMIT,
  });

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6 text-muted-foreground" aria-hidden />}
        title="No products yet"
        description="Check back soon for new arrivals in this category."
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Products</h2>
        <Link
          href={`/products?category=${categorySlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </div>
      <div
        tabIndex={0}
        className="flex snap-x gap-4 overflow-x-auto pb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
