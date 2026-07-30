import "server-only";

import type { Cart, CartTransport } from "@/features/cart/types/cart";
import { apiFetch } from "@/lib/api/http";
import { sanitizeCartResponse } from "@/lib/cart-response";

export async function getCart(): Promise<Cart> {
  // Render contexts cannot write cookies, and identity-scoped cart reads must
  // never be explicitly memoized or receive cache metadata.
  const transport = await apiFetch<CartTransport>("/cart", {
    auth: "optional",
    cartSession: true,
  });

  return sanitizeCartResponse(transport);
}
