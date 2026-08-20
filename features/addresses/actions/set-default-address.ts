"use server";

import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { addressNotFound } from "@/features/addresses/actions/address-not-found";
import { setDefaultAddressSchema } from "@/features/addresses/schema/set-default-address-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

export async function setDefaultAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { id } = setDefaultAddressSchema.parse(Object.fromEntries(formData));

    await apiFetch(`/addresses/${encodeURIComponent(id)}/default`, {
      method: "PATCH",
      auth: "required",
    });

    revalidatePath("/account/addresses");
    return toActionState("SUCCESS", "Default address updated", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return addressNotFound(formData);
    }
    return fromErrorToActionState(error, "required", formData);
  }
}
