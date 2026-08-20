"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { deleteReviewSchema } from "@/features/reviews/schema/delete-review-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

function revalidateReviewCaches(productId: string, slug: string) {
  revalidatePath(`/products/${slug}`);
  updateTag(`product:${productId}:reviews`);
  updateTag(`product:${slug}`);
  updateTag("products");
}

export async function deleteReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let reviewId: string;
  let productId: string;
  let slug: string;

  try {
    ({ reviewId, productId, slug } = deleteReviewSchema.parse(
      Object.fromEntries(formData),
    ));
  } catch (error) {
    return fromErrorToActionState(error, "required", formData);
  }

  try {
    await apiFetch(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: "DELETE",
      auth: "required",
    });

    revalidateReviewCaches(productId, slug);

    return toActionState("SUCCESS", "Review deleted", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      revalidateReviewCaches(productId, slug);
    }
    return fromErrorToActionState(error, "required", formData);
  }
}
