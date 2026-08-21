import { z } from "zod";

import {
  addressLine1Schema,
  areaSchema,
  citySchema,
  detailsSchema,
  governorateSchema,
  latitudeSchema,
  longitudeSchema,
  optionalBlankToUndefined,
  postalCodeSchema,
} from "@/features/addresses/schema/address-field-schema";
import { couponCodeSchema } from "@/features/checkout/schema/coupon-schema";
import { paymentMethodSchema } from "@/features/checkout/schema/payment-method-schema";
import { countrySchema } from "@/lib/constants/egypt-locations";
import { egyptPhoneSchema } from "@/lib/constants/egypt-phone";

export const guestCheckoutSchema = z.object({
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    phone: egyptPhoneSchema,
    email: z.email().trim().toLowerCase(),
  }),
  shipping: z.object({
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
  }),
  paymentMethod: paymentMethodSchema,
  couponCode: z.preprocess(optionalBlankToUndefined, couponCodeSchema.optional()),
  notes: z.preprocess(optionalBlankToUndefined, z.string().trim().max(1000).optional()),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

/**
 * Bridges flat dotted `FormData` names (`contact.email`,
 * `shipping.governorate`, … from `AddressFormFields`'s `namePrefix`) into the
 * nested shape `guestCheckoutSchema` expects. Hardened against prototype
 * pollution: intermediates are null-prototype objects, and path segments
 * `__proto__` / `constructor` / `prototype` are skipped. Dotted field-error
 * keys for Zod failures come from `fromCheckoutErrorToActionState` in
 * `checkout-error-resolver.ts` (via `ZodError.issues`), not `z.flattenError`.
 */
function unflattenFormData(formData: FormData): Record<string, unknown> {
  const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  const result: Record<string, unknown> = Object.create(null);

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const parts = key.split(".");
    if (parts.some((part) => DANGEROUS_KEYS.has(part))) continue;

    let cursor = result;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value;
        return;
      }
      const next = cursor[part];
      if (next == null || typeof next !== "object") {
        cursor[part] = Object.create(null);
      }
      cursor = cursor[part] as Record<string, unknown>;
    });
  }

  return result;
}

export function parseGuestCheckoutFormData(formData: FormData): GuestCheckoutInput {
  return guestCheckoutSchema.parse(unflattenFormData(formData));
}
