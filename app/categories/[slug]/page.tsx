import type { Metadata } from "next";

import CategoryFeature from "@/features/categories";
import { getCategory } from "@/features/categories/queries/get-category";

type CategoryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description: `Shop the ${category.name} collection at SG Couture.`,
    openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;

  return <CategoryFeature slug={slug} />;
}
