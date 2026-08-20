"use server";

import { auth } from "@clerk/nextjs/server";

import type {
  Cart,
  CartActionResult,
  CartTransport,
} from "@/features/cart/types/cart";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { sanitizeCartResponse } from "@/lib/cart-response";
import { clearCartSession, getCartSession } from "@/lib/cart-session";

/**
 * Registered checkout depends on this completing first: the authenticated
 * GET /cart merges any anonymous cart before checkout UI may proceed, so
 * checkout must never render from an unmerged guest view.
 */
export async function syncCartAction(): Promise<CartActionResult> {
  try {
    const existingSession = await getCartSession();
    const transportCart = await apiFetch<CartTransport>("/cart", {
      auth: "required",
      cartSession: true,
    });
    const { userId } = await auth();
    if (existingSession && userId != null) {
      await clearCartSession();
    }
    return sanitizeCartResponse<Cart>(transportCart);
  } catch (error) {
    redirectOnAuthError(error, "required");
    return { error: toInteractiveActionError(error) };
  }
}
