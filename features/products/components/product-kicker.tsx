import type { ProductCategoryRef } from "@/features/products/types/product";

type ProductKickerProps = {
  category: ProductCategoryRef;
  subCategory?: ProductCategoryRef;
};

export function ProductKicker({
  category,
  subCategory,
}: ProductKickerProps) {
  return (
    <p className="text-eyebrow">
      {category.name}
      {subCategory ? ` · ${subCategory.name}` : null}
    </p>
  );
}
