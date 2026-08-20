"use server";

import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { addressNotFound } from "@/features/addresses/actions/address-not-found";
import { updateAddressSchema } from "@/features/addresses/schema/update-address-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

export async function updateAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = updateAddressSchema.parse(Object.fromEntries(formData));
    const { id, postalCode, latitude, longitude, ...required } = parsed;

    await apiFetch(`/addresses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: {
        ...required,
        ...(postalCode !== undefined ? { postalCode } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      },
      auth: "required",
    });

    revalidatePath("/account/addresses");
    return toActionState("SUCCESS", "Address updated", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "RESOURCE_NOT_FOUND") {
      return addressNotFound(formData);
    }
    return fromErrorToActionState(error, "required", formData);
  }
}
