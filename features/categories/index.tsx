import { LucideImage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { Badge } from "@/components/ui/badge";
import { CategoryProducts } from "@/features/categories/components/category-products";
import { CategoryProductsSkeleton } from "@/features/categories/components/category-products-skeleton";
import { getCategory } from "@/features/categories/queries/get-category";

type CategoryFeatureProps = {
  slug: string;
};

export default async function CategoryFeature({ slug }: CategoryFeatureProps) {
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← All categories
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted sm:aspect-square sm:w-48 sm:shrink-0">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(min-width: 640px) 192px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LucideImage className="size-8 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{category.name}</h1>
          <Badge variant="secondary">
            {category.productCount} {category.productCount === 1 ? "item" : "items"}
          </Badge>
          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {category.subCategories.map((subCategory) => (
                <Link
                  key={subCategory.id}
                  href={`/products?category=${category.slug}&subCategory=${subCategory.slug}`}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {subCategory.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <SectionErrorBoundary title="Products">
        <Suspense fallback={<CategoryProductsSkeleton />}>
          <CategoryProducts categorySlug={category.slug} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
