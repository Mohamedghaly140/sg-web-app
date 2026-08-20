"use server";

import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { createAddressSchema } from "@/features/addresses/schema/create-address-schema";
import { apiFetch } from "@/lib/api/http";

export async function createAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = createAddressSchema.parse(Object.fromEntries(formData));
    const { isDefault, postalCode, latitude, longitude, ...required } = parsed;

    await apiFetch("/addresses", {
      method: "POST",
      body: {
        ...required,
        ...(postalCode !== undefined ? { postalCode } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ...(isDefault === "true" ? { isDefault: true } : {}),
      },
      auth: "required",
    });

    revalidatePath("/account/addresses");
    return toActionState("SUCCESS", "Address saved", formData);
  } catch (error) {
    return fromErrorToActionState(error, "required", formData);
  }
}
