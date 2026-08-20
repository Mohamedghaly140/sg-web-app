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
      className="group flex flex-col items-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Soft-rounded: navigational imagery, see product-card.tsx for the square merchandise-photography counterpart. */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 150px, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <LucideImage className="size-8 text-muted-foreground" aria-hidden />
          </div>
        )}
      </div>
      <p className="text-eyebrow line-clamp-1 text-foreground">
        {category.name}
      </p>
      <p className="text-xs text-muted-foreground">
        {category.productCount}{" "}
        {category.productCount === 1 ? "item" : "items"}
      </p>
    </Link>
  );
}
