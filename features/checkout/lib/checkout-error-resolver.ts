import { ZodError } from "zod";

import {
  fromErrorToActionState,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import {
  ApiError,
  getStockErrors,
  getVariantErrors,
  type StockErrorEntry,
  type VariantErrorEntry,
} from "@/lib/api/api-error";

function flattenZodIssuesToFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

export type CheckoutStep = "cart" | "address" | "coupon" | "payment" | "review";

export type CheckoutErrorProjection = {
  step: CheckoutStep;
  code: string;
  message: string;
  variantErrors?: VariantErrorEntry[];
  stockErrors?: StockErrorEntry[];
};

/**
 * Maps a checkout `ApiError` to the wizard step it should send the customer
 * back to, and to customer-facing copy. Per §5.5, `INVALID_VARIANT` and
 * `INSUFFICIENT_STOCK` route to "cart" rather than carrying structured
 * per-line detail through this resolver — `/cart`'s existing drift-detection
 * UI (features/cart/components/cart-line-item.tsx) already renders that
 * correction once the cart cache is refreshed, so checkout does not
 * duplicate it. Never branch on `error.message`.
 */
export function resolveCheckoutError(error: unknown): CheckoutErrorProjection {
  if (!(error instanceof ApiError)) {
    return {
      step: "review",
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  switch (error.code) {
    case "PAYMENT_METHOD_UNAVAILABLE":
      return {
        step: "payment",
        code: error.code,
        message: "Card payment isn't available yet — choose Cash on delivery.",
      };
    case "CART_EMPTY":
      return { step: "cart", code: error.code, message: "Your cart is empty." };
    case "SHIPPING_NOT_AVAILABLE":
      return {
        step: "address",
        code: error.code,
        message: "We don't deliver to that destination yet.",
      };
    case "INVALID_VARIANT":
      return {
        step: "cart",
        code: error.code,
        message: "Some items in your cart are no longer available. Review your cart to continue.",
        variantErrors: getVariantErrors(error),
      };
    case "INSUFFICIENT_STOCK":
      return {
        step: "cart",
        code: error.code,
        message: "Some items don't have enough stock. Review your cart to continue.",
        stockErrors: getStockErrors(error),
      };
    case "COUPON_EXPIRED":
      return { step: "coupon", code: error.code, message: "This coupon has expired." };
    case "COUPON_INACTIVE":
      return { step: "coupon", code: error.code, message: "This coupon is no longer active." };
    case "COUPON_EXHAUSTED":
      return {
        step: "coupon",
        code: error.code,
        message: "This coupon has reached its usage limit.",
      };
    case "COUPON_USER_LIMIT":
      return { step: "coupon", code: error.code, message: "You've already used this coupon." };
    case "RESOURCE_NOT_FOUND":
      // Registered checkout: ambiguous between a stale saved address and a
      // stale coupon — the code alone doesn't distinguish them (§5.5).
      return {
        step: "review",
        code: error.code,
        message: "Your selected address or coupon is no longer valid. Please review and try again.",
      };
    case "RATE_LIMITED":
      return {
        step: "review",
        code: error.code,
        message: "Too many attempts — please wait a moment and try again.",
      };
    default:
      return { step: "review", code: error.code, message: error.message };
  }
}

/**
 * `placeGuestOrderAction` and `placeOrderAction` both funnel their catch
 * block through this instead of the generic `fromErrorToActionState` —
 * reuses its `ZodError`/`ApiError` field-error extraction and
 * `redirectOnAuthError` side effect, but overrides `message`/`response`
 * with checkout-specific step routing so the wizard knows where to send the
 * customer back to.
 */
export function fromCheckoutErrorToActionState(
  error: unknown,
  mode: "public" | "optional" | "required",
  formData: FormData,
): ActionState {
  if (error instanceof ZodError) {
    const base = fromErrorToActionState(error, mode, formData);
    return {
      ...base,
      message: "Please check the highlighted fields.",
      fieldErrors: flattenZodIssuesToFieldErrors(error),
    };
  }

  const projection = resolveCheckoutError(error);
  const base = fromErrorToActionState(error, mode, formData);

  return {
    ...base,
    message: projection.message,
    response: {
      ...base.response,
      step: projection.step,
      checkoutCode: projection.code,
      variantErrors: projection.variantErrors
        ? JSON.stringify(projection.variantErrors)
        : undefined,
      stockErrors: projection.stockErrors
        ? JSON.stringify(projection.stockErrors)
        : undefined,
    },
  };
}

export function parseCheckoutStructuredErrors(
  response: ActionState["response"],
): { variantErrors: VariantErrorEntry[]; stockErrors: StockErrorEntry[] } {
  const parseArray = <T,>(value: unknown): T[] => {
    if (typeof value !== "string") return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  return {
    variantErrors: parseArray<VariantErrorEntry>(response?.variantErrors),
    stockErrors: parseArray<StockErrorEntry>(response?.stockErrors),
  };
}
