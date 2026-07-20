import "server-only";

import { cache } from "react";

import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";
import type { ProductDetail } from "@/features/products/types/product";

export const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    return await apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
      auth: "public",
      next: { revalidate: 120, tags: [`product:${slug}`] },
    });
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return null;
    }
    throw error;
  }
});
