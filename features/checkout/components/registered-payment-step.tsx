"use client";

import { Button } from "@/components/ui/button";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";

export type RegisteredPaymentStepProps = {
  active: boolean;
  onBack: () => void;
  onNext: () => void;
};

export function RegisteredPaymentStep({
  active,
  onBack,
  onNext,
}: RegisteredPaymentStepProps) {
  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Payment method">
      <p className="text-sm text-muted-foreground">
        Cash on delivery — card payments coming soon
      </p>
      <PaymentMethodSelect name="paymentMethod" />
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Continue
        </Button>
      </div>
    </section>
  );
}
