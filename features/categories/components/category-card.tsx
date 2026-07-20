import { LucideImage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/features/categories/types/category";

const MAX_VISIBLE_SUBCATEGORIES = 3;

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const visibleSubCategories = category.subCategories.slice(0, MAX_VISIBLE_SUBCATEGORIES);
  const hiddenSubCategoryCount = category.subCategories.length - visibleSubCategories.length;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-3">
      <Link
        href={`/categories/${category.slug}`}
        className="flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <LucideImage className="size-8 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground">{category.name}</p>
          <Badge variant="secondary">
            {category.productCount} {category.productCount === 1 ? "item" : "items"}
          </Badge>
        </div>
      </Link>
      {visibleSubCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSubCategories.map((subCategory) => (
            <Link
              key={subCategory.id}
              href={`/products?category=${category.slug}&subCategory=${subCategory.slug}`}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {subCategory.name}
            </Link>
          ))}
          {hiddenSubCategoryCount > 0 && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              +{hiddenSubCategoryCount} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
