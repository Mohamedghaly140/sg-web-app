import type { Metadata } from "next";

import ProductsFeature from "@/features/products";
import { productsSearchParamsCache } from "@/features/products/hooks/products-search-params";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the complete SG Couture catalog.",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedSearchParams = await productsSearchParamsCache.parse(
    resolvedSearchParams,
  );

  return <ProductsFeature searchParams={parsedSearchParams} />;
}
