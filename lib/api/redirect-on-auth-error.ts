import { redirect } from "next/navigation";
import { ApiError } from "./api-error";

/**
 * Central mapping for auth ApiError codes. Branches on `code`, never HTTP
 * status (two distinct 403s exist).
 */
export function redirectOnAuthError(error: unknown): void {
  if (!(error instanceof ApiError)) {
    return;
  }

  if (error.code === "UNAUTHENTICATED") {
    redirect("/sign-in");
  }

  if (error.code === "ACCOUNT_DISABLED") {
    redirect("/account-disabled");
  }
}
