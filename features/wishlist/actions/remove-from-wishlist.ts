"use server";

import { revalidatePath } from "next/cache";

import { wishlistProductIdSchema } from "@/features/wishlist/schema/wishlist-product-id-schema";
import type { RemoveFromWishlistResult } from "@/features/wishlist/types/wishlist";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";

export async function removeFromWishlistAction(
  input: unknown,
): Promise<RemoveFromWishlistResult> {
  try {
    const { productId } = wishlistProductIdSchema.parse(input);
    await apiFetch(`/wishlist/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      auth: "required",
    });
    revalidatePath("/account/wishlist");
    return { removed: true };
  } catch (error) {
    redirectOnAuthError(error, "required");
    return { error: toInteractiveActionError(error) };
  }
}
