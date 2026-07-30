import { z, ZodError } from "zod";

import { ApiError } from "@/lib/api/api-error";

export type InteractiveActionError = {
  error: { code: string; message: string; errors?: unknown };
};

export function toInteractiveActionError(
  error: unknown,
): InteractiveActionError["error"] {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof ZodError) {
    return {
      code: "VALIDATION_ERROR",
      message: "Please check the submitted values.",
      errors: z.flattenError(error).fieldErrors,
    };
  }

  if (error instanceof Error) {
    return { code: "UNKNOWN", message: error.message };
  }

  return { code: "UNKNOWN", message: "An unknown error occurred" };
}
