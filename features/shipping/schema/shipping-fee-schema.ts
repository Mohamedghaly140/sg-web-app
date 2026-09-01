import { z } from "zod";

import { countrySchema } from "@/lib/constants/egypt-locations";

const destinationSchema = z.string().trim().min(1);

export const shippingFeeInputSchema = z.object({
  country: countrySchema,
  governorate: destinationSchema,
  city: destinationSchema.optional(),
});

export type ShippingFeeInput = z.infer<typeof shippingFeeInputSchema>;
