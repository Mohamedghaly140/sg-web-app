import { z } from "zod";

import { optionalBlankToUndefined } from "@/features/addresses/schema/address-field-schema";
import { couponCodeSchema } from "@/features/checkout/schema/coupon-schema";
import { paymentMethodSchema } from "@/features/checkout/schema/payment-method-schema";

export const placeOrderSchema = z.object({
  shippingAddressId: z.string().trim().min(1),
  paymentMethod: paymentMethodSchema,
  couponCode: z.preprocess(optionalBlankToUndefined, couponCodeSchema.optional()),
  notes: z.preprocess(optionalBlankToUndefined, z.string().trim().max(1000).optional()),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
