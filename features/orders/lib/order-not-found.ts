import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";

/** Shared RESOURCE_NOT_FOUND handler for order mutations (not a Server Action). */
export function orderNotFound(formData?: FormData, id?: string): ActionState {
  if (id) {
    revalidatePath(`/account/orders/${id}`);
  }
  revalidatePath("/account/orders");
  return toActionState(
    "ERROR",
    "This order no longer exists or isn't available.",
    formData,
  );
}
