"use server";

import { shippingFeeInputSchema } from "@/features/checkout/schema/shipping-fee-schema";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { apiFetch } from "@/lib/api/http";
import {
  toInteractiveActionError,
  type InteractiveActionError,
} from "@/lib/api/to-interactive-action-error";

export type ShippingFeeActionResult = ShippingFee | InteractiveActionError;

// GET /shipping/fee is Public and not cart-aware (07-shipping.md) — no
// identity headers, no cache metadata (an estimate must always be fresh).
export async function getShippingFeeAction(
  input: unknown,
): Promise<ShippingFeeActionResult> {
  try {
    const parsed = shippingFeeInputSchema.parse(input);
    const params = new URLSearchParams({
      country: parsed.country,
      governorate: parsed.governorate,
      ...(parsed.city ? { city: parsed.city } : {}),
    });

    return await apiFetch<ShippingFee>(`/shipping/fee?${params.toString()}`, {
      auth: "public",
    });
  } catch (error) {
    return { error: toInteractiveActionError(error) };
  }
}
