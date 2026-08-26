"use server";

import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromCheckoutErrorToActionState } from "@/features/checkout/lib/checkout-error-resolver";
import { placeOrderSchema } from "@/features/checkout/schema/registered-checkout-schema";
import type { OrderDetail } from "@/features/checkout/types/order";
import { apiFetch } from "@/lib/api/http";

// No cart-session cookie touches this action — it is Auth-only, and
// `CartMergeBridge`/`syncCartAction` already merged any guest cart before
// this page could render (see plan Context). Client-side TanStack cache
// reset to EMPTY_CART happens in `RegisteredCheckoutContent`.
export async function placeOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = placeOrderSchema.parse(Object.fromEntries(formData));

    const order = await apiFetch<OrderDetail>("/orders", {
      method: "POST",
      body: {
        shippingAddressId: input.shippingAddressId,
        paymentMethod: input.paymentMethod,
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
      },
      auth: "required",
    });

    revalidatePath("/account/orders");

    return toActionState("SUCCESS", "Order placed", formData, {
      humanOrderId: order.humanOrderId,
      orderId: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid ? "true" : "false",
      createdAt: order.createdAt,
      items: JSON.stringify(order.items),
      itemsSubtotal: order.itemsSubtotal,
      discountApplied: order.discountApplied,
      shippingFees: order.shippingFees,
      totalOrderPrice: order.totalOrderPrice,
    });
  } catch (error) {
    return fromCheckoutErrorToActionState(error, "required", formData);
  }
}
