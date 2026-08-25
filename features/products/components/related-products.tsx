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
      <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
        <h2
          id="related-products-heading"
          className="font-heading text-2xl font-normal text-foreground"
        >
          You may also like
        </h2>
        <Link
          href={`/categories/${categorySlug}`}
          className="shrink-0 text-xs text-accent-strong underline-offset-3 hover:underline"
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
            imageSizes="(min-width: 640px) 248px, 212px"
          />
        ))}
      </div>
    </section>
  );
}
