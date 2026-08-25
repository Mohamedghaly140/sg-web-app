import { LucideLayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { getCategories } from "@/features/categories/queries/get-categories";
import { BandHeader } from "@/features/home/components/band-header";

const MAX_HOME_COLLECTIONS = 3;

export async function CollectionsSection() {
  const categories = await getCategories();
  const collections = categories.slice(0, MAX_HOME_COLLECTIONS);

  if (collections.length === 0) {
    return (
      <EmptyState
        icon={<LucideLayoutGrid className="size-6 text-muted-foreground" aria-hidden />}
        title="No categories yet"
        description="Check back soon — new categories are on the way."
      />
    );
  }

  return (
    <section>
      <BandHeader
        title="The collections"
        linkHref="/categories"
        linkLabel="All categories"
      />
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {collections.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <div className="plate relative aspect-[4/3] overflow-hidden bg-muted">
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={`${category.name} collection`}
                  fill
                  sizes="(min-width: 1280px) 380px, (min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-heading text-[19px] font-normal text-foreground">
                {category.name}
              </span>
              <span className="figures text-xs text-muted-foreground">
                {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
