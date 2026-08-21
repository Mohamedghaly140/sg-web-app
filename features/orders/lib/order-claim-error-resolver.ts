import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import {
  TRACKING_INVALID_MESSAGE,
  TRACKING_RATE_LIMITED_MESSAGE,
} from "@/features/orders/lib/order-tracking-copy";
import { ApiError } from "@/lib/api/api-error";

export function fromClaimErrorToActionState(
  error: unknown,
  formData: FormData,
): ActionState {
  const base = fromErrorToActionState(error, "required", formData);

  if (error instanceof ApiError && error.code === "CLAIM_TOKEN_INVALID") {
    revalidatePath("/account/orders");
    return { ...base, message: TRACKING_INVALID_MESSAGE };
  }

  if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
    return { ...base, message: TRACKING_INVALID_MESSAGE };
  }

  if (error instanceof ApiError && error.code === "RATE_LIMITED") {
    return { ...base, message: TRACKING_RATE_LIMITED_MESSAGE };
  }

  return base;
}
