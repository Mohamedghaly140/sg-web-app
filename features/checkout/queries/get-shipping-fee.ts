import "server-only";

import type { ShippingFee } from "@/features/checkout/types/shipping";
import { apiFetch } from "@/lib/api/http";

export type GetShippingFeeParams = {
  country: string;
  governorate: string;
  city?: string;
};

/**
 * Server Component read path for `GET /shipping/fee` (Public, 07-shipping.md).
 *
 * The sibling `actions/get-shipping-fee.ts` Server Action covers the checkout
 * form, where the destination changes as the shopper types and the result has to
 * reach a client component. This is the RSC equivalent for surfaces that already
 * know the destination when they render.
 *
 * No cache metadata on purpose: an estimate goes stale the moment the shipping
 * configuration changes, and `07-shipping.md` is explicit that the completed
 * order's fee is the final one. `apiFetch` defaults to `cache: "no-store"`.
 *
 * Throws `ApiError` — notably `422 SHIPPING_NOT_AVAILABLE` when no zone matches.
 * Callers decide whether that hides a row or surfaces an error.
 */
export async function getShippingFee({
  country,
  governorate,
  city,
}: GetShippingFeeParams): Promise<ShippingFee> {
  const params = new URLSearchParams({ country, governorate });

  if (city) {
    params.set("city", city);
  }

  return apiFetch<ShippingFee>(`/shipping/fee?${params.toString()}`, {
    auth: "public",
  });
}
