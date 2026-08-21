import { z } from "zod";

import { citySchema, governorateSchema } from "@/features/addresses/schema/address-field-schema";
import { countrySchema } from "@/lib/constants/egypt-locations";

export const shippingFeeInputSchema = z.object({
  country: countrySchema,
  governorate: governorateSchema,
  city: citySchema.optional(),
});

export type ShippingFeeInput = z.infer<typeof shippingFeeInputSchema>;
