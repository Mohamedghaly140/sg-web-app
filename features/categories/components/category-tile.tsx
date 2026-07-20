import { LucideImage } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/features/categories/types/category";

type CategoryTileProps = {
  category: Category;
};

export function CategoryTile({ category }: CategoryTileProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex flex-col items-center gap-2 text-center"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 150px, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LucideImage className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">
        {category.name}
      </p>
    </Link>
  );
}
