import type { Metadata } from "next";

import ProductDetailFeature from "@/features/products/components/product-detail-feature";
import { getProduct } from "@/features/products/queries/get-product";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// `getProduct` is React-`cache`d, so this and the page body share one backend call.
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.imageUrl] },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <ProductDetailFeature slug={slug} searchParams={resolvedSearchParams} />
  );
}
