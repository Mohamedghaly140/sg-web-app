"use server";

import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromCancelErrorToActionState } from "@/features/orders/lib/order-cancel-error-resolver";
import { cancelOrderSchema } from "@/features/orders/schema/cancel-order-schema";
import { apiFetch } from "@/lib/api/http";

export async function cancelOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawId = formData.get("id");
  const idForError = typeof rawId === "string" ? rawId : "";

  try {
    const { id } = cancelOrderSchema.parse(Object.fromEntries(formData));

    await apiFetch(`/orders/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      auth: "required",
    });

    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath("/account");
    return toActionState("SUCCESS", "Order cancelled", formData);
  } catch (error) {
    return fromCancelErrorToActionState(error, idForError, formData);
  }
}
