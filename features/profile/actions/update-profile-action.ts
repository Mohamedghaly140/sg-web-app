"use server";

import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { updateProfileSchema } from "@/features/profile/schema/update-profile-schema";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = updateProfileSchema.parse(Object.fromEntries(formData));
    await apiFetch("/users/me", {
      method: "PATCH",
      body: input,
      auth: "required",
    });
    revalidatePath("/account");
    return toActionState("SUCCESS", "Profile updated", formData);
  } catch (error) {
    if (error instanceof ApiError && error.code === "DUPLICATE_RESOURCE") {
      return {
        ...toActionState("ERROR", error.message, formData),
        fieldErrors: { phone: [error.message] },
      };
    }
    return fromErrorToActionState(error, "required", formData);
  }
}
