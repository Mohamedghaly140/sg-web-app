import { redirect } from "next/navigation";
import { ApiError } from "./api-error";

/**
 * Central mapping for auth ApiError codes. Disabled accounts redirect from
 * every auth mode because Optional calls can still carry a signed-in identity;
 * unauthenticated redirects apply only to Required calls because anonymous
 * Optional calls are expected. Branches on `code`, never HTTP status.
 */
export function redirectOnAuthError(
  error: unknown,
  mode: "public" | "optional" | "required",
): void {
  if (!(error instanceof ApiError)) {
    return;
  }

  if (error.code === "ACCOUNT_DISABLED") {
    redirect("/account-disabled");
  }

  if (mode === "required" && error.code === "UNAUTHENTICATED") {
    redirect("/sign-in");
  }
}
