"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { updateReviewSchema } from "@/features/reviews/schema/update-review-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

function revalidateReviewCaches(productId: string, slug: string) {
  revalidatePath(`/products/${slug}`);
  updateTag(`product:${productId}:reviews`);
  updateTag(`product:${slug}`);
  updateTag("products");
}

export async function updateReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let title: string | undefined;
  let ratings: number;
  let productId: string;
  let slug: string;
  let reviewId: string;

  try {
    ({ title, ratings, productId, slug, reviewId } =
      updateReviewSchema.parse(Object.fromEntries(formData)));
  } catch (error) {
    return fromErrorToActionState(error, "required", formData);
  }

  try {
    await apiFetch(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: "PATCH",
      body: {
        ...(title !== undefined ? { title } : {}),
        ratings,
      },
      auth: "required",
    });

    revalidateReviewCaches(productId, slug);

    return toActionState("SUCCESS", "Review updated", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      revalidateReviewCaches(productId, slug);
    }
    return fromErrorToActionState(error, "required", formData);
  }
}
