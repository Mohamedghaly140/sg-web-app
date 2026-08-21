"use server";

import { validateCouponSchema } from "@/features/checkout/schema/coupon-schema";
import type {
  CouponActionResult,
  CouponPreviewTransport,
} from "@/features/checkout/types/coupon";
import { apiFetch } from "@/lib/api/http";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
import { toInteractiveActionError } from "@/lib/api/to-interactive-action-error";
import { captureRefreshAndSanitizeCart } from "@/lib/cart-response";
import { getCartSession } from "@/lib/cart-session";

// POST /coupons/validate is cart-aware (Optional auth, X-Cart-Session) but
// is never a cookie-deletion event — §5.2 explicitly limits deletion to
// merge, guest checkout, and anonymous clear. `captureRefreshAndSanitizeCart`
// still runs so an unexpected `sessionToken` on this response is captured or
// the existing cookie is refreshed, exactly like every other cart-aware call.
export async function validateCouponAction(
  input: unknown,
): Promise<CouponActionResult> {
  try {
    const parsed = validateCouponSchema.parse(input);
    const existingSession = await getCartSession();
    const transport = await apiFetch<CouponPreviewTransport>("/coupons/validate", {
      method: "POST",
      body: parsed,
      auth: "optional",
      cartSession: true,
    });

    return await captureRefreshAndSanitizeCart(transport, existingSession);
  } catch (error) {
    redirectOnAuthError(error, "optional");
    return { error: toInteractiveActionError(error) };
  }
}
