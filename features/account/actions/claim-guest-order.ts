"use server";

import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { claimOrderAction } from "@/features/orders/actions/claim-order";
import { claimTokenSchema } from "@/features/orders/schema/claim-token-schema";

export async function claimGuestOrderFromAccountAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = claimTokenSchema.safeParse(formData.get("token"));
  if (!parsed.success) {
    return toActionState(
      "ERROR",
      "Enter the 64-character tracking code from your confirmation email.",
      formData,
    );
  }

  return claimOrderAction(parsed.data, prevState, formData);
}
