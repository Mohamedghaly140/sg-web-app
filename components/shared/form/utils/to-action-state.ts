import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { z, ZodError } from "zod";
import { ApiError, getValidationErrors } from "@/lib/api/api-error";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";

export type ActionState = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: Record<string, string | string[]>;
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number;
  response?: Record<string, string | number | undefined | null>;
};

export const EMPTY_ACTION_STATE: ActionState = {
  message: "",
  fieldErrors: {},
  timestamp: Date.now(),
};

const toPayload = (
  formData?: FormData,
): Record<string, string | string[]> | undefined => {
  if (!formData) return undefined;
  // Object.fromEntries would collapse repeated keys (multi-selects, tag
  // inputs like sizes/colors) down to their last value — group them instead.
  const payload: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    const values = formData
      .getAll(key)
      .filter((value): value is string => typeof value === "string");
    if (values.length === 0) continue;
    payload[key] = values.length === 1 ? values[0] : values;
  }
  return payload;
};

export const fromErrorToActionState = (
  error: unknown,
  mode: "public" | "optional" | "required",
  formData?: FormData,
  response?: Record<string, string | number>,
): ActionState => {
  redirectOnAuthError(error, mode);

  if (isClerkAPIResponseError(error)) {
    const message = error.errors[0]?.longMessage ?? error.errors[0]?.message ?? "An error occurred";
    return {
      status: "ERROR",
      message,
      fieldErrors: {},
      payload: toPayload(formData),
      timestamp: Date.now(),
      response,
    };
  }
  if (error instanceof ZodError) {
    return {
      status: "ERROR",
      message: "",
      fieldErrors: z.flattenError(error).fieldErrors,
      payload: toPayload(formData),
      timestamp: Date.now(),
      response,
    };
  }
  if (error instanceof ApiError) {
    // Branch on `code`, never on `status` or `message` — two distinct 403s exist.
    const apiResponse = { code: error.code, status: error.status, ...response };

    const fieldErrors = getValidationErrors(error);
    if (fieldErrors) {
      return {
        status: "ERROR",
        message: error.message,
        fieldErrors,
        payload: toPayload(formData),
        timestamp: Date.now(),
        response: apiResponse,
      };
    }

    if (error.code === "FORBIDDEN") {
      return {
        status: "ERROR",
        message: "You don't have permission to do this.",
        fieldErrors: {},
        payload: toPayload(formData),
        timestamp: Date.now(),
        response: apiResponse,
      };
    }

    // 409 family and everything else: the API's message is human-readable.
    return {
      status: "ERROR",
      message: error.message,
      fieldErrors: {},
      payload: toPayload(formData),
      timestamp: Date.now(),
      response: apiResponse,
    };
  }
  if (error instanceof Error) {
    return {
      status: "ERROR",
      message: error.message,
      fieldErrors: {},
      payload: toPayload(formData),
      timestamp: Date.now(),
      response,
    };
  }
  return toActionState(
    "ERROR",
    "An unknown error occurred",
    formData,
    response,
  );
};

export const toActionState = (
  status: ActionState["status"],
  message: string,
  formData?: FormData,
  response?: Record<string, string | number | undefined | null>,
): ActionState => {
  return {
    status,
    message,
    fieldErrors: {},
    timestamp: Date.now(),
    payload: toPayload(formData),
    response,
  };
};
