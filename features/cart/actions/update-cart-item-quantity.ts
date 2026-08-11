"use server";

import { updateCartItemQuantitySchema } from "@/features/cart/schema/update-cart-item-quantity-schema";
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

export async function updateCartItemQuantityAction(
  input: unknown,
): Promise<CartActionResult> {
  try {
    const { itemId, quantity } = updateCartItemQuantitySchema.parse(input);
    const existingSession = await getCartSession();
    const transportCart = await apiFetch<CartTransport>(
      `/cart/items/${encodeURIComponent(itemId)}`,
      {
        method: "PATCH",
        body: { quantity },
        auth: "optional",
        cartSession: true,
      },
    );
    const cart = await captureRefreshAndSanitizeCart<Cart>(
      transportCart,
      existingSession,
    );

    return cart;
  } catch (error) {
    redirectOnAuthError(error, "optional");
    return { error: toInteractiveActionError(error) };
  }
}
