import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";
import type { Category } from "@/features/categories/types/category";

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  try {
    return await apiFetch<Category>(`/categories/${encodeURIComponent(slug)}`, {
      auth: "public",
      next: { revalidate: 300, tags: [`category:${slug}`] },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return null;
    }
    throw error;
  }
});
