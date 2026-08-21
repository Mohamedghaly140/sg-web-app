import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_-]{3,30}$/, "Enter a valid coupon code");

export const validateCouponSchema = z.object({
  code: couponCodeSchema,
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
