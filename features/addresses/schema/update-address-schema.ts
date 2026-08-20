import { z } from "zod";

import {
  addressLine1Schema,
  aliasSchema,
  areaSchema,
  citySchema,
  detailsSchema,
  governorateSchema,
  latitudeSchema,
  longitudeSchema,
  postalCodeSchema,
} from "@/features/addresses/schema/address-field-schema";
import { countrySchema } from "@/lib/constants/egypt-locations";
import { egyptPhoneSchema } from "@/lib/constants/egypt-phone";

/** No `isDefault` — change default only via PATCH /addresses/:id/default. */
export const updateAddressSchema = z
  .object({
    id: z.string().min(1),
    alias: aliasSchema,
    country: countrySchema,
    governorate: governorateSchema,
    city: citySchema,
    area: areaSchema,
    phone: egyptPhoneSchema,
    addressLine1: addressLine1Schema,
    details: detailsSchema,
    postalCode: postalCodeSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  })
  .strict();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
