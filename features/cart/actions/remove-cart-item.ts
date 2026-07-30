"use server";

import { revalidatePath } from "next/cache";

import { removeCartItemSchema } from "@/features/cart/schema/remove-cart-item-schema";
import type {
  Cart,
  CartActionResult,
  CartTransport,
} from "@/features/cart/types/cart";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { captureRefreshAndSanitizeCart } from "@/lib/cart-response";
import { getCartSession } from "@/lib/cart-session";

export async function removeCartItemAction(
  input: unknown,
): Promise<CartActionResult> {
  try {
    const { itemId } = removeCartItemSchema.parse(input);
    const existingSession = await getCartSession();
    const transportCart = await apiFetch<CartTransport>(
      `/cart/items/${encodeURIComponent(itemId)}`,
      {
        method: "DELETE",
        auth: "optional",
        cartSession: true,
      },
    );
    const cart = await captureRefreshAndSanitizeCart<Cart>(
      transportCart,
      existingSession,
    );

    revalidatePath("/cart");
    return cart;
  } catch (error) {
    redirectOnAuthError(error, "optional");
    return { error: toInteractiveActionError(error) };
  }
}
