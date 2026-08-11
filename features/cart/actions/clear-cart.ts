"use server";

import { auth } from "@clerk/nextjs/server";

import {
  EMPTY_CART,
  type CartActionResult,
} from "@/features/cart/types/cart";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { clearCartSession } from "@/lib/cart-session";

export async function clearCartAction(): Promise<CartActionResult> {
  try {
    const { userId } = await auth();

    await apiFetch("/cart", {
      method: "DELETE",
      auth: "optional",
      cartSession: true,
    });

    if (userId == null) {
      await clearCartSession();
    }

    return EMPTY_CART;
  } catch (error) {
    redirectOnAuthError(error, "optional");
    return { error: toInteractiveActionError(error) };
  }
}
