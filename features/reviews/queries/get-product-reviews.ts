import "server-only";

import type { Review } from "@/features/reviews/types/review";
import {
  apiFetch,
  type PageMeta,
  type Paginated,
} from "@/lib/api/http";

export async function getProductReviews(
  productId: string,
  page: number,
  limit: number,
): Promise<{ reviews: Review[]; meta: PageMeta }> {
  const result = await apiFetch<Paginated<Review>>(
    `/products/${encodeURIComponent(productId)}/reviews?page=${page}&limit=${limit}`,
    {
      auth: "public",
      next: {
        revalidate: 60,
        tags: [`product:${productId}:reviews`],
      },
    },
  );

  return { reviews: result.data, meta: result.meta };
}
