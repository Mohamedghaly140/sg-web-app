"use client";

import { useCallback, useMemo, useState } from "react";

import {
  getStockErrors,
  getValidationErrors,
  getVariantErrors,
  type StockErrorEntry,
  type VariantErrorEntry,
} from "@/lib/api/api-error";
import type { InteractiveActionError } from "@/lib/api/to-interactive-action-error";

export type CartActionErrorPayload = InteractiveActionError["error"];

/**
 * A cart failure narrowed by `code`, with the contract's structured `errors[]`
 * already parsed. Never branch on `message` — it is display text only.
 */
export type CartErrorView = {
  code: string;
  message: string;
  stockErrors?: StockErrorEntry[];
  variantErrors?: VariantErrorEntry[];
  fieldErrors?: Record<string, string[]>;
};

export function toCartErrorView(
  error: CartActionErrorPayload,
): CartErrorView {
  return {
    code: error.code,
    message: error.message,
    stockErrors: getStockErrors(error),
    variantErrors: getVariantErrors(error),
    fieldErrors: getValidationErrors(error),
  };
}

/** Stock available for one product, from an `INSUFFICIENT_STOCK` payload. */
export function availableForProduct(
  view: CartErrorView | undefined,
  productId: string,
): number | undefined {
  return view?.stockErrors?.find((entry) => entry.productId === productId)
    ?.available;
}

/** Variant rejection for one product, from an `INVALID_VARIANT` payload. */
export function variantErrorForProduct(
  view: CartErrorView | undefined,
  productId: string,
): VariantErrorEntry | undefined {
  return view?.variantErrors?.find((entry) => entry.productId === productId);
}

export type CartErrorState = {
  errors: Record<string, CartErrorView>;
  getError: (key: string) => CartErrorView | undefined;
  setError: (key: string, error: CartActionErrorPayload) => void;
  clearError: (key: string) => void;
  clearErrors: () => void;
};

/**
 * Per-control cart error state, keyed by cart item `id` on the cart page and by
 * `productId` on product detail. Populate it from a mutation `onSuccess` when
 * `"error" in result` — interactive cart actions resolve with their failure
 * rather than rejecting, so `onError` never fires for an API error.
 */
export function useCartErrorState(): CartErrorState {
  const [errors, setErrors] = useState<Record<string, CartErrorView>>({});

  const setError = useCallback(
    (key: string, error: CartActionErrorPayload) => {
      setErrors((current) => ({ ...current, [key]: toCartErrorView(error) }));
    },
    [],
  );

  const clearError = useCallback((key: string) => {
    setErrors((current) => {
      if (!(key in current)) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors((current) => (Object.keys(current).length === 0 ? current : {}));
  }, []);

  const getError = useCallback(
    (key: string) => errors[key],
    [errors],
  );

  return useMemo(
    () => ({ errors, getError, setError, clearError, clearErrors }),
    [errors, getError, setError, clearError, clearErrors],
  );
}
