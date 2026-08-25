import { LucideLayoutGrid } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { CategoryColumn } from "@/features/categories/components/category-column";
import { getCategories } from "@/features/categories/queries/get-categories";

/* The handoff marks this an `h2` because its artboard nests every screen under
   a frame heading. The real page has no other `h1`, so it renders `h1`;
   globals.css sets `h1,h2 { font-weight: 400 }`, making it visually identical. */
export async function CategoriesFeature() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={<LucideLayoutGrid className="size-6 text-muted-foreground" aria-hidden />}
          title="No categories yet"
          description="Check back soon — new categories are on the way."
        />
      </div>
    );
  }

  const pieceCount = categories.reduce(
    (total, category) => total + category.productCount,
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-baseline gap-6 border-b border-border pb-6">
        <h1 className="flex-none font-heading text-[34px] leading-tight font-normal text-foreground">
          The index
        </h1>
        <p className="text-justify max-w-[58ch] text-[13px] text-muted-foreground">
          {categories.length} collections, {pieceCount} pieces. Every line below goes
          straight to what is in stock under it.
        </p>
        <span className="ml-auto text-xs text-muted-foreground">Updated hourly</span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {categories.map((category) => (
          <CategoryColumn key={category.id} category={category} />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <span className="text-eyebrow">Shortcuts</span>
        <div className="flex gap-2">
          <Badge variant="outline" render={<Link href="/products?sort=newest" />}>
            New in
          </Badge>
          <Badge
            variant="outline"
            render={<Link href="/products?maxPrice=2000" />}
          >
            Under 2,000 EGP
          </Badge>
          <Badge
            variant="outline"
            render={<Link href="/products?sort=top_rated" />}
          >
            Top rated
          </Badge>
        </div>
      </div>
    </div>
  );
}
