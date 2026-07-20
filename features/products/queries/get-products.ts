import "server-only";

import { apiFetch, type Paginated } from "@/lib/api/http";
import type { ProductSummary } from "@/features/products/types/product";

export type ProductsSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "best_selling"
  | "top_rated";

export type GetProductsParams = {
  featured?: boolean;
  sort?: ProductsSortOption;
  limit?: number;
  page?: number;
};

export async function getProducts(
  params: GetProductsParams = {},
): Promise<Paginated<ProductSummary>> {
  const searchParams = new URLSearchParams();

  if (params.featured !== undefined) {
    searchParams.set("featured", String(params.featured));
  }
  if (params.sort !== undefined) {
    searchParams.set("sort", params.sort);
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  const query = searchParams.toString();

  return apiFetch<Paginated<ProductSummary>>(
    `/products${query ? `?${query}` : ""}`,
    {
      auth: "public",
      next: { revalidate: 120, tags: ["products"] },
    },
  );
}
