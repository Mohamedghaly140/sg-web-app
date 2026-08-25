import type { Category } from "@/features/categories/types/category";
import type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";

type ProductsTitleBandProps = {
  categories: Category[];
  searchParams: ProductsSearchParams;
};

/* The design pairs this heading with a justified 56ch intro paragraph. No API
   field carries category copy -- `GET /categories` returns name, slug, image
   and counts only -- so the paragraph is omitted rather than invented. Recorded
   as GAP-13 in docs/backend-contract-gaps.md.

   The handoff marks this an `h2` because its artboard nests every screen under
   a frame heading. The real page has no other `h1`, so it renders `h1`;
   globals.css sets `h1,h2 { font-weight: 400 }`, making it visually identical. */
export function ProductsTitleBand({
  categories,
  searchParams,
}: ProductsTitleBandProps) {
  const selectedCategory = categories.find(
    (category) => category.slug === searchParams.category,
  );

  return (
    <div className="flex items-baseline gap-6 border-b border-border pb-6">
      <h1 className="flex-none font-heading text-[34px] leading-tight font-normal text-foreground">
        {selectedCategory?.name ?? "The catalogue"}
      </h1>
    </div>
  );
}
