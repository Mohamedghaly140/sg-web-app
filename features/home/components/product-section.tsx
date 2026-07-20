import Link from "next/link";

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

export async function ProductSection({ title, viewAllHref, queryParams }: ProductSectionProps) {
  const { data: products } = await getProducts(queryParams);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
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
