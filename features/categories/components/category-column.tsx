import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/features/categories/types/category";

export function CategoryColumn({ category }: { category: Category }) {
  const hasEmptySubCategory = category.subCategories.some(
    (subCategory) => subCategory.productCount === 0,
  );
  const categoryHref = `/products?category=${category.slug}`;

  return (
    <div>
      <Link href={categoryHref} aria-label={category.name}>
        <div className="plate relative aspect-4/3 overflow-hidden bg-muted">
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              fill
              sizes="(min-width: 1280px) 380px, (min-width: 640px) 33vw, 100vw"
              className="object-cover"
              alt={category.name}
            />
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-baseline justify-between border-b border-border pb-2">
        <Link
          href={categoryHref}
          className="font-heading text-[24px] font-normal text-foreground transition-colors hover:text-accent-strong"
        >
          {category.name}
        </Link>
        <span className="figures text-xs text-muted-foreground">{category.productCount}</span>
      </div>

      {category.subCategories.map((subCategory) =>
        subCategory.productCount > 0 ? (
          <Link
            key={subCategory.id}
            href={`/products?subCategory=${subCategory.slug}`}
            className="flex items-center justify-between border-b border-border py-2 text-[13.5px] text-foreground hover:text-accent-strong"
          >
            {subCategory.name}
            <span className="figures text-xs text-muted-foreground">{subCategory.productCount}</span>
          </Link>
        ) : (
          <div
            key={subCategory.id}
            className="flex items-center justify-between border-b border-border py-2 text-[13.5px] text-foreground opacity-45"
          >
            {subCategory.name}
            <span className="figures text-xs text-muted-foreground">{subCategory.productCount}</span>
          </div>
        ),
      )}

      {hasEmptySubCategory && (
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          Empty sub-categories stay visible but unlinked — a zero count is a real
          answer, not a missing page.
        </p>
      )}
    </div>
  );
}
