import "server-only";

import { apiFetch } from "@/lib/api/http";
import type { Category } from "@/features/home/types/category";

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories", { auth: "public" });
}
