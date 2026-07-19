export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "ACCOUNT_DISABLED"
  | "RESOURCE_NOT_FOUND"
  | "PAYMENT_METHOD_UNAVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "INVALID_VARIANT"
  | (string & {});

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getValidationErrors(
  error: ApiError,
): Record<string, string[]> | undefined {
  if (error.code !== "VALIDATION_ERROR" || !Array.isArray(error.errors)) {
    return undefined;
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const entry of error.errors) {
    if (
      !isRecord(entry) ||
      typeof entry.field !== "string" ||
      !isRecord(entry.constraints)
    ) {
      return undefined;
    }

    const messages: string[] = [];
    for (const message of Object.values(entry.constraints)) {
      if (typeof message !== "string") {
        return undefined;
      }
      messages.push(message);
    }

    (fieldErrors[entry.field] ??= []).push(...messages);
  }

  return fieldErrors;
}

export function getStockErrors(
  error: ApiError,
): { productId: string; requested: number; available: number }[] | undefined {
  if (error.code !== "INSUFFICIENT_STOCK" || !Array.isArray(error.errors)) {
    return undefined;
  }

  const stockErrors: {
    productId: string;
    requested: number;
    available: number;
  }[] = [];

  for (const entry of error.errors) {
    if (
      !isRecord(entry) ||
      typeof entry.productId !== "string" ||
      typeof entry.requested !== "number" ||
      !Number.isFinite(entry.requested) ||
      typeof entry.available !== "number" ||
      !Number.isFinite(entry.available)
    ) {
      return undefined;
    }

    stockErrors.push({
      productId: entry.productId,
      requested: entry.requested,
      available: entry.available,
    });
  }

  return stockErrors;
}

export function getVariantErrors(
  error: ApiError,
):
  | { productId: string; color: string; size: string; code: string }[]
  | undefined {
  if (error.code !== "INVALID_VARIANT" || !Array.isArray(error.errors)) {
    return undefined;
  }

  const variantErrors: {
    productId: string;
    color: string;
    size: string;
    code: string;
  }[] = [];

  for (const entry of error.errors) {
    if (
      !isRecord(entry) ||
      typeof entry.productId !== "string" ||
      typeof entry.color !== "string" ||
      typeof entry.size !== "string" ||
      typeof entry.code !== "string"
    ) {
      return undefined;
    }

    variantErrors.push({
      productId: entry.productId,
      color: entry.color,
      size: entry.size,
      code: entry.code,
    });
  }

  return variantErrors;
}
