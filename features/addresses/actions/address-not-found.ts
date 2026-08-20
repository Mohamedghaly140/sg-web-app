import { revalidatePath } from "next/cache";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";

/** Shared RESOURCE_NOT_FOUND handler for address mutations (not a Server Action). */
export function addressNotFound(formData?: FormData): ActionState {
  revalidatePath("/account/addresses");
  return toActionState(
    "ERROR",
    "Address not found. It may have been removed — refresh the page and try again.",
    formData,
  );
}
