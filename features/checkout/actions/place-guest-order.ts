"use server";

import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromCheckoutErrorToActionState } from "@/features/checkout/lib/checkout-error-resolver";
import { parseGuestCheckoutFormData } from "@/features/checkout/schema/guest-checkout-schema";
import type { GuestOrderDetail } from "@/features/checkout/types/order";
import { apiFetch } from "@/lib/api/http";
import { clearCartSession } from "@/lib/cart-session";

export async function placeGuestOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = parseGuestCheckoutFormData(formData);
    const { postalCode, latitude, longitude, ...requiredShipping } = input.shipping;

    const order = await apiFetch<GuestOrderDetail>("/orders/guest", {
      method: "POST",
      body: {
        contact: input.contact,
        shipping: {
          ...requiredShipping,
          ...(postalCode !== undefined ? { postalCode } : {}),
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
        },
        paymentMethod: input.paymentMethod,
        ...(input.couponCode ? { couponCode: input.couponCode } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
      },
      auth: "optional",
      cartSession: true,
    });

    // One of the three documented `sg_cart_session` deletion events. The
    // client-side TanStack cart cache reset to EMPTY_CART happens in the
    // wizard (Task 9) — a Server Action cannot touch `queryClient`.
    await clearCartSession();
    revalidatePath("/account/orders");

    return toActionState("SUCCESS", "Order placed", formData, {
      humanOrderId: order.humanOrderId,
      itemsSubtotal: order.itemsSubtotal,
      discountApplied: order.discountApplied,
      shippingFees: order.shippingFees,
      totalOrderPrice: order.totalOrderPrice,
    });
  } catch (error) {
    return fromCheckoutErrorToActionState(error, "optional", formData);
  }
}
