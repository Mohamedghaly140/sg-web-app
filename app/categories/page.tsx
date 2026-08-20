import type { Metadata } from "next";

import { CategoriesFeature } from "@/features/categories/components/categories-feature";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all Safa Ghaly categories.",
};

export default function CategoriesPage() {
  return <CategoriesFeature />;
}
