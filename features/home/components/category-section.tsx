import { LucideLayoutGrid } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { CategoryTile } from "@/features/categories/components/category-tile";
import { getCategories } from "@/features/categories/queries/get-categories";

const MAX_HOME_CATEGORIES = 8;

export async function CategorySection() {
  const categories = await getCategories();
  const topLevelCategories = categories.slice(0, MAX_HOME_CATEGORIES);

  if (topLevelCategories.length === 0) {
    return (
      <EmptyState
        icon={<LucideLayoutGrid className="size-6 text-muted-foreground" aria-hidden />}
        title="No categories yet"
        description="Check back soon — new categories are on the way."
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          Shop by Category
        </h2>
        {categories.length > MAX_HOME_CATEGORIES && (
          <Link
            href="/categories"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {topLevelCategories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
