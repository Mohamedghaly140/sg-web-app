import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { orderNotFound } from "@/features/orders/lib/order-not-found";
import { ApiError } from "@/lib/api/api-error";

export function fromCancelErrorToActionState(
  error: unknown,
  id: string,
  formData: FormData,
): ActionState {
  if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
    return orderNotFound(formData, id);
  }

  if (error instanceof ApiError && error.code === "INVALID_STATUS_TRANSITION") {
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/account/orders");
    const base = fromErrorToActionState(error, "required", formData);
    return {
      ...base,
      message:
        "This order's status has changed and can no longer be cancelled.",
    };
  }

  return fromErrorToActionState(error, "required", formData);
}
