import "server-only";

import type { Category } from "@/features/categories/types/category";
import { apiFetch } from "@/lib/api/http";

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", {
    auth: "public",
    next: { revalidate: 300, tags: ["categories"] },
  });
}
