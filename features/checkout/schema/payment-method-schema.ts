import { z } from "zod";

// v1 is CASH-only — CARD returns 422 PAYMENT_METHOD_UNAVAILABLE until a
// future backend contract exists (docs/phase-5-checkout.md §5.6).
export const paymentMethodSchema = z.literal("CASH");
