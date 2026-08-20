"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { findOwnReview } from "@/features/reviews/actions/find-own-review";
import { createReviewSchema } from "@/features/reviews/schema/create-review-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

function parseResumePage(formData: FormData): number {
  const raw = formData.get("resumePage");
  if (typeof raw !== "string") return 1;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function revalidateReviewCaches(productId: string, slug: string) {
  revalidatePath(`/products/${slug}`);
  updateTag(`product:${productId}:reviews`);
  updateTag(`product:${slug}`);
  updateTag("products");
}

async function resolveReviewExists(
  productId: string,
  formData: FormData,
  sourceError?: unknown,
): Promise<ActionState> {
  const fallbackError =
    sourceError ??
    new ApiError(409, "REVIEW_EXISTS", "Review already exists");

  const { userId } = await auth();
  if (!userId) {
    return fromErrorToActionState(fallbackError, "required", formData);
  }

  const resumePage = parseResumePage(formData);

  try {
    const result = await findOwnReview({
      productId,
      userId,
      startPage: resumePage,
    });

    if (result.status === "found") {
      return toActionState(
        "ERROR",
        "You already reviewed this product — edit it below.",
        formData,
        {
          code: "REVIEW_EXISTS",
          reviewId: result.review.id,
          title: result.review.title,
          ratings: result.review.ratings,
        },
      );
    }

    if (
      result.status === "rate_limited" ||
      result.status === "cap_exceeded"
    ) {
      return toActionState(
        "ERROR",
        "Please try again in a moment.",
        formData,
        {
          code: "RETRY",
          resumePage: result.resumePage,
        },
      );
    }

    return fromErrorToActionState(fallbackError, "required", formData);
  } catch (error) {
    return fromErrorToActionState(error, "required", formData);
  }
}

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const resumeSearch = formData.get("resumeSearch") === "true";
  const productIdForResume = String(formData.get("productId") ?? "");

  if (resumeSearch) {
    return resolveReviewExists(productIdForResume, formData);
  }

  try {
    // resumePage / resumeSearch are storefront-local (GAP-2 retry) and must
    // not enter the .strict() whitelist — pick schema fields explicitly.
    const { title, ratings, productId, slug } = createReviewSchema.parse({
      title: formData.get("title") ?? undefined,
      ratings: formData.get("ratings") ?? undefined,
      productId: formData.get("productId") ?? undefined,
      slug: formData.get("slug") ?? undefined,
    });

    await apiFetch(`/products/${encodeURIComponent(productId)}/reviews`, {
      method: "POST",
      body: {
        ...(title !== undefined ? { title } : {}),
        ratings,
      },
      auth: "required",
    });

    revalidateReviewCaches(productId, slug);

    return toActionState("SUCCESS", "Review posted", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "REVIEW_EXISTS") {
      const productId = String(formData.get("productId") ?? "");
      return resolveReviewExists(productId, formData, error);
    }

    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      const slug = formData.get("slug");
      if (typeof slug === "string" && slug.length > 0) {
        revalidatePath(`/products/${slug}`);
      }
      return fromErrorToActionState(error, "required", formData);
    }

    return fromErrorToActionState(error, "required", formData);
  }
}
