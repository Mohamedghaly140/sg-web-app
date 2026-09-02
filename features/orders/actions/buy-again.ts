"use server";

import type { OrderDetail, OrderItem } from "@/features/checkout/types/order";
import { addCartItemSchema } from "@/features/cart/schema/add-cart-item-schema";
import type { Cart, CartTransport } from "@/features/cart/types/cart";
import { buyAgainSchema } from "@/features/orders/schema/buy-again-schema";
import type {
  BuyAgainResult,
  BuyAgainSkippedItem,
} from "@/features/orders/types/buy-again";
import { ApiError, getStockErrors } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { captureRefreshAndSanitizeCart } from "@/lib/cart-response";
import { getCartSession } from "@/lib/cart-session";

const SKIPPABLE_CODES = new Set([
  "INSUFFICIENT_STOCK",
  "INVALID_VARIANT",
  "RESOURCE_NOT_FOUND",
]);

function toSkippedItem(
  item: OrderItem,
  code: string,
  error?: ApiError,
): BuyAgainSkippedItem {
  const stockError = error
    ? getStockErrors(error)?.find(
        (entry) => entry.productId === item.productId,
      )
    : undefined;

  return {
    productId: item.productId,
    code,
    ...(stockError ? { available: stockError.available } : {}),
  };
}

export async function buyAgainAction(input: unknown): Promise<BuyAgainResult> {
  let orderId: string;

  try {
    ({ orderId } = buyAgainSchema.parse(input));
  } catch (error) {
    return { error: toInteractiveActionError(error) };
  }

  let order: OrderDetail;

  try {
    order = await apiFetch<OrderDetail>(
      `/orders/${encodeURIComponent(orderId)}`,
      { auth: "required" },
    );
  } catch (error) {
    redirectOnAuthError(error, "required");
    return { error: toInteractiveActionError(error) };
  }

  const existingSession = await getCartSession();
  const skipped: BuyAgainSkippedItem[] = [];
  let firstSkippedError: ReturnType<
    typeof toInteractiveActionError
  > | null = null;
  let lastCart: Cart | null = null;
  let added = 0;

  const total = order.items.length;

  for (const item of order.items) {
    try {
      const cartItem = addCartItemSchema.parse({
        productId: item.productId,
        quantity: item.quantity,
        ...(item.color ? { color: item.color } : {}),
        ...(item.size ? { size: item.size } : {}),
      });
      const transportCart = await apiFetch<CartTransport>("/cart/items", {
        method: "POST",
        body: cartItem,
        auth: "required",
        cartSession: true,
      });

      lastCart = await captureRefreshAndSanitizeCart<Cart>(
        transportCart,
        existingSession,
      );
      added += 1;
    } catch (error) {
      redirectOnAuthError(error, "required");
      const actionError = toInteractiveActionError(error);

      if (error instanceof ApiError && SKIPPABLE_CODES.has(error.code)) {
        skipped.push(toSkippedItem(item, error.code, error));
        firstSkippedError ??= actionError;
        continue;
      }

      // A non-skippable code (429, 5xx, network) is a real failure, not proof
      // that this line or any line after it is unavailable — so report it as
      // `failure` and leave `skipped` to the codes that actually establish
      // unavailability. Whatever already landed stays authoritative.
      if (lastCart) {
        return { cart: lastCart, added, total, skipped, failure: actionError };
      }

      return { error: actionError };
    }
  }

  if (lastCart) {
    return { cart: lastCart, added, total, skipped };
  }

  return {
    error:
      firstSkippedError ??
      {
        code: "UNKNOWN",
        message: "This order has no pieces to add.",
      },
  };
}
