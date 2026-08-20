import "server-only";
import { ApiError } from "./api-error";
import { apiFetch } from "./http";

export async function isAccountDisabled(): Promise<boolean> {
  try {
    await apiFetch("/users/me", { auth: "required" });
    return false;
  } catch (error) {
    return error instanceof ApiError && error.code === "ACCOUNT_DISABLED";
  }
}
