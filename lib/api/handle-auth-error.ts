import "server-only";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "./api-error";
import { redirectOnAuthError } from "./redirect-on-auth-error";

/**
 * Central mapping for read-path ApiError codes — call from queries or pages,
 * never scatter try/catch. Branches on `code`, never HTTP status (two
 * distinct 403s exist).
 */
export function handleAuthError(error: unknown): never {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  redirectOnAuthError(error);

  switch (error.code) {
    case "RESOURCE_NOT_FOUND":
      notFound();
    case "FORBIDDEN":
      redirect("/access-denied");
    default:
      throw error;
  }
}
