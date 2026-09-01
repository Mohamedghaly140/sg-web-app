import "server-only";

import type { CurrentUser } from "@/features/account/types/user";
import { handleAuthError } from "@/lib/api/handle-auth-error";
import { apiFetch } from "@/lib/api/http";

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    return await apiFetch<CurrentUser>("/users/me", { auth: "required" });
  } catch (error) {
    handleAuthError(error);
  }
}
