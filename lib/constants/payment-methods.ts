export type PaymentMethod = "CASH" | "CARD";

export type PaymentMethodOption = {
  value: PaymentMethod;
  label: string;
  enabled: boolean;
  disabledReason?: string;
};

/**
 * Config seam for §5.6: CARD stays visible but disabled until a real backend
 * payment-session contract exists (currently 422 PAYMENT_METHOD_UNAVAILABLE).
 * Flip `enabled` when that contract ships — `paymentMethodSchema`
 * (features/checkout/schema/payment-method-schema.ts) still gates submission
 * independently, so enabling here alone is not enough to accept CARD orders.
 */
export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "CASH", label: "Cash on delivery", enabled: true },
  { value: "CARD", label: "Card", enabled: false, disabledReason: "Coming soon" },
];
