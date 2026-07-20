import { LucideLayoutGrid } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { CategoryCard } from "@/features/categories/components/category-card";
import { getCategories } from "@/features/categories/queries/get-categories";

export async function CategoriesFeature() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<LucideLayoutGrid className="size-6 text-muted-foreground" aria-hidden />}
          title="No categories yet"
          description="Check back soon — new categories are on the way."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Categories
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
