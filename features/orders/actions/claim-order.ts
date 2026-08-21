"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

import { setCookieByKey } from "@/actions/cookies.actions";
import {
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { fromClaimErrorToActionState } from "@/features/orders/lib/order-claim-error-resolver";
import { TRACKING_INVALID_MESSAGE } from "@/features/orders/lib/order-tracking-copy";
import { claimTokenSchema } from "@/features/orders/schema/claim-token-schema";
import type { OrderDetail } from "@/features/checkout/types/order";
import { apiFetch } from "@/lib/api/http";

export async function claimOrderAction(
  token: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedToken = claimTokenSchema.safeParse(token);
  if (!parsedToken.success) {
    return toActionState("ERROR", TRACKING_INVALID_MESSAGE, formData);
  }

  let order: OrderDetail;
  try {
    order = await apiFetch<OrderDetail>("/orders/claim", {
      method: "POST",
      body: { token: parsedToken.data },
      auth: "required",
    });
  } catch (error) {
    return fromClaimErrorToActionState(error, formData);
  }

  // redirect() must stay outside try/catch — it throws a NEXT_REDIRECT error
  // that fromClaimErrorToActionState would otherwise convert into ActionState
  // (Next docs + docs/01-conventions.md).
  revalidatePath("/account/orders");
  await setCookieByKey("toast", "Order claimed");
  redirect(`/account/orders/${order.id}`, RedirectType.replace);
}
