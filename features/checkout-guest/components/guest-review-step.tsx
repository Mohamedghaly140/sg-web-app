"use client";

import { Money } from "@/components/shared/money";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";
import type { GuestCheckoutStep } from "@/features/checkout/hooks/checkout-search-params";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import type { Cart } from "@/features/cart/types/cart";
import type { StockErrorEntry, VariantErrorEntry } from "@/lib/api/api-error";

export type GuestReviewStepProps = {
  step: GuestCheckoutStep;
  cart: Cart;
  shippingFee: ShippingFee | null;
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
  onPaymentBack: () => void;
  onPaymentNext: () => void;
  onReviewBack: () => void;
  variantErrors: VariantErrorEntry[];
  stockErrors: StockErrorEntry[];
};

export function GuestReviewStep({
  step,
  cart,
  shippingFee,
  applied,
  onApplied,
  onPaymentBack,
  onPaymentNext,
  onReviewBack,
  variantErrors,
  stockErrors,
}: GuestReviewStepProps) {
  return (
    <>
      <section
        hidden={step !== "payment"}
        className="flex flex-col gap-4"
        aria-label="Payment method"
      >
        <p className="text-sm text-muted-foreground">
          Cash on delivery — card payments coming soon
        </p>
        <PaymentMethodSelect name="paymentMethod" />
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPaymentBack}>
            Back
          </Button>
          <Button type="button" onClick={onPaymentNext}>
            Continue
          </Button>
        </div>
      </section>

      <section hidden={step !== "review"} aria-label="Review order">
        <Card>
          <CardContent className="flex flex-col gap-6 pt-6">
            <CheckoutCartSummary
              cart={cart}
              variantErrors={variantErrors}
              stockErrors={stockErrors}
            />

            {shippingFee ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  <Money value={shippingFee.fee} />
                </span>
              </div>
            ) : null}

            <CouponForm applied={applied} onApplied={onApplied} />
            <input type="hidden" name="couponCode" value={applied?.code ?? ""} />

            <p className="text-justify text-[11.5px] text-muted-foreground">
              Checking out as a guest. We email a tracking link valid for 30
              days — sign in with the same email later to keep the order in
              your account.
            </p>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onReviewBack}>
                Back
              </Button>
              <SubmitButton label="Place order" />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
