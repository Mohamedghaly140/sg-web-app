"use client";

import { Money } from "@/components/shared/money";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Address } from "@/features/addresses/types/address";
import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import type { Cart } from "@/features/cart/types/cart";
import type { StockErrorEntry, VariantErrorEntry } from "@/lib/api/api-error";

export type RegisteredReviewStepProps = {
  active: boolean;
  cart: Cart;
  selectedAddress: Address | null;
  shippingFee: ShippingFee | null;
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
  onBack: () => void;
  variantErrors: VariantErrorEntry[];
  stockErrors: StockErrorEntry[];
};

export function RegisteredReviewStep({
  active,
  cart,
  selectedAddress,
  shippingFee,
  applied,
  onApplied,
  onBack,
  variantErrors,
  stockErrors,
}: RegisteredReviewStepProps) {
  return (
    <section hidden={!active} aria-label="Review order">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <CheckoutCartSummary
            cart={cart}
            variantErrors={variantErrors}
            stockErrors={stockErrors}
          />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Items subtotal</dt>
              <dd><Money value={cart.totalCartPrice} /></dd>
            </div>
            {applied ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Coupon discount</dt>
                <dd>-<Money value={applied.discountApplied} /></dd>
              </div>
            ) : null}
            {shippingFee ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd><Money value={shippingFee.fee} /></dd>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-4 font-medium text-foreground">
              <dt>Total so far</dt>
              <dd><Money value={cart.totalPriceAfterDiscount} /></dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Confirmed at the next step. Nothing is reserved until you place the order.
          </p>

          <CouponForm applied={applied} onApplied={onApplied} />
          <input type="hidden" name="couponCode" value={applied?.code ?? ""} />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <SubmitButton
              label="Place order"
              disabled={!selectedAddress || !shippingFee}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
