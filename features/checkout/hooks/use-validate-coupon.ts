"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { validateCouponAction } from "@/features/checkout/actions/validate-coupon";
import type { ValidateCouponInput } from "@/features/checkout/schema/coupon-schema";
import type { CouponActionResult } from "@/features/checkout/types/coupon";

export function useValidateCoupon(
  options?: Omit<
    UseMutationOptions<CouponActionResult, Error, ValidateCouponInput>,
    "mutationFn" | "retry"
  >,
) {
  return useMutation({
    ...options,
    mutationFn: validateCouponAction,
    retry: 0,
  });
}
