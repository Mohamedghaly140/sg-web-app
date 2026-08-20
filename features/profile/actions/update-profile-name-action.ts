"use server";

import { revalidatePath } from "next/cache";

import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import { updateProfileNameSchema } from "@/features/profile/schema/update-profile-name-schema";
import { apiFetch } from "@/lib/api/http";

export async function updateProfileNameAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const input = updateProfileNameSchema.parse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });
    await apiFetch("/users/me", {
      method: "PATCH",
      body: input,
      auth: "required",
    });
    revalidatePath("/account");
    return toActionState("SUCCESS", "Name updated", formData);
  } catch (error) {
    return fromErrorToActionState(error, "required", formData);
  }
}
