import "server-only";

import type { Profile } from "@/features/profile/types/profile";
import { handleAuthError } from "@/lib/api/handle-auth-error";
import { apiFetch } from "@/lib/api/http";

export async function getProfile(): Promise<Profile> {
  try {
    return await apiFetch<Profile>("/users/me", { auth: "required" });
  } catch (error) {
    handleAuthError(error);
  }
}
