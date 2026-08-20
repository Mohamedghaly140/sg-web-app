"use server";

import { revalidatePath } from "next/cache";

import { wishlistProductIdSchema } from "@/features/wishlist/schema/wishlist-product-id-schema";
import type { AddToWishlistResult } from "@/features/wishlist/types/wishlist";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";

export async function addToWishlistAction(
  input: unknown,
): Promise<AddToWishlistResult> {
  try {
    const { productId } = wishlistProductIdSchema.parse(input);
    const result = await apiFetch<{ added: true }>(
      `/wishlist/${encodeURIComponent(productId)}`,
      { method: "PUT", auth: "required" },
    );
    revalidatePath("/account/wishlist");
    return result;
  } catch (error) {
    redirectOnAuthError(error, "required");
    return { error: toInteractiveActionError(error) };
  }
}
