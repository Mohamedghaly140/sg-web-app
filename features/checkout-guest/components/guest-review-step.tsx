"use client";

import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import type { Cart } from "@/features/cart/types/cart";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import type { StockErrorEntry, VariantErrorEntry } from "@/lib/api/api-error";
import { formatEGP } from "@/lib/format";

export type GuestReviewStepProps = {
  active: boolean;
  cart: Cart;
  shippingFee: ShippingFee | null;
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
  onBack: () => void;
  variantErrors: VariantErrorEntry[];
  stockErrors: StockErrorEntry[];
};

export function GuestReviewStep({
  active,
  cart,
  shippingFee,
  applied,
  onApplied,
  onBack,
  variantErrors,
  stockErrors,
}: GuestReviewStepProps) {
  return (
    <section hidden={!active} className="flex flex-col gap-6" aria-label="Review order">
      <CheckoutCartSummary
        cart={cart}
        variantErrors={variantErrors}
        stockErrors={stockErrors}
      />

      {shippingFee ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">{formatEGP(shippingFee.fee)}</span>
        </div>
      ) : null}

      <CouponForm applied={applied} onApplied={onApplied} />
      <input type="hidden" name="couponCode" value={applied?.code ?? ""} />

      <PaymentMethodSelect name="paymentMethod" />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <SubmitButton label="Place order" />
      </div>
    </section>
  );
}
