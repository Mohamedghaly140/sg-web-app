import Link from "next/link";

import { ProductCard } from "@/features/products/components/product-card";
import type { ProductSummary } from "@/features/products/types/product";

type RelatedProductsProps = {
  products: ProductSummary[];
  categorySlug: string;
};

export function RelatedProducts({
  products,
  categorySlug,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  // The caller may pass up to 7 items after filtering the current product out of an 8-item page; that is expected.
  return (
    <section aria-labelledby="related-products-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2
          id="related-products-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          You may also like
        </h2>
        <Link
          href={`/categories/${categorySlug}`}
          className="shrink-0 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-48 shrink-0 sm:w-56"
          />
        ))}
      </div>
    </section>
  );
}
