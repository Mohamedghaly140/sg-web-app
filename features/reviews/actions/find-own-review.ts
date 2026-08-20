import "server-only";

import type { Review } from "@/features/reviews/types/review";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch, type Paginated } from "@/lib/api/http";

const PAGE_LIMIT = 100;
const MAX_PAGES_PER_INVOCATION = 8;

export type FindOwnReviewResult =
  | { status: "found"; review: Review }
  | { status: "rate_limited"; resumePage: number }
  | { status: "cap_exceeded"; resumePage: number }
  | { status: "not_found" };

/**
 * GAP-2 fallback: page the public review list for the caller's own review.
 * Not a Server Action — only invoked from create-review on the server.
 */
export async function findOwnReview({
  productId,
  userId,
  startPage,
}: {
  productId: string;
  userId: string;
  startPage: number;
}): Promise<FindOwnReviewResult> {
  let page = startPage;
  let lastHasNext = false;

  for (let i = 0; i < MAX_PAGES_PER_INVOCATION; i++) {
    try {
      const result = await apiFetch<Paginated<Review>>(
        `/products/${encodeURIComponent(productId)}/reviews?page=${page}&limit=${PAGE_LIMIT}`,
        { auth: "public" },
      );

      const match = result.data.find((review) => review.user.id === userId);
      if (match) {
        return { status: "found", review: match };
      }

      lastHasNext = result.meta.hasNext;
      if (!lastHasNext) {
        return { status: "not_found" };
      }

      page += 1;
    } catch (error) {
      if (error instanceof ApiError && error.code === "RATE_LIMITED") {
        return { status: "rate_limited", resumePage: page };
      }
      throw error;
    }
  }

  if (lastHasNext) {
    return { status: "cap_exceeded", resumePage: page };
  }

  return { status: "not_found" };
}
