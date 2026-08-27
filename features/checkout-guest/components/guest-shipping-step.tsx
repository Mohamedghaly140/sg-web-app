"use client";

import Link from "next/link";
import { useCallback, useState, type MouseEvent } from "react";

import { Money } from "@/components/shared/money";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { TextareaControl } from "@/components/shared/textarea-control/textarea-control";
import { Button } from "@/components/ui/button";
import { AddressFormFields } from "@/features/addresses/components/address-form-fields";
import { ShippingEstimate } from "@/features/checkout/components/shipping-estimate";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

export type GuestShippingStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
  onBack: () => void;
  onFeeChange: (fee: ShippingFee | null) => void;
  onSummaryChange: (summary: string) => void;
};

export function GuestShippingStep({
  active,
  actionState,
  onNext,
  onBack,
  onFeeChange,
  onSummaryChange,
}: GuestShippingStepProps) {
  const [destination, setDestination] = useState<{
    country: string;
    governorate: string;
    city: string;
  }>({
    country: DEFAULT_COUNTRY,
    governorate: "",
    city: "",
  });
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);

  const handleDestinationChange = useCallback(
    (next: { country: string; governorate: string; city: string }) => {
      setDestination(next);
    },
    [],
  );

  const handleResolved = useCallback(
    (fee: ShippingFee | null) => {
      setShippingFee(fee);
      onFeeChange(fee);
    },
    [onFeeChange],
  );

  function handleNext(event: MouseEvent<HTMLButtonElement>) {
    const formData = new FormData(event.currentTarget.form!);
    const addressLine =
      formData.get("shipping.addressLine1")?.toString().trim() ?? "";
    const city = formData.get("shipping.city")?.toString().trim() ?? "";
    const governorate =
      formData.get("shipping.governorate")?.toString().trim() ?? "";
    const destination = [city, governorate].filter(Boolean).join(", ");

    onSummaryChange(
      [addressLine, destination].filter(Boolean).join(" · "),
    );
    onNext();
  }

  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Shipping address">
      <ShippingEstimate
        country={destination.country}
        governorate={destination.governorate}
        city={destination.city}
        onResolved={handleResolved}
      >
        {({ isPending, fee, error }) => (
          <>
            <AddressFormFields
              mode="guest"
              layout="grid"
              namePrefix="shipping"
              actionState={actionState}
              destinationFeedback={
                error ? (
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-xs text-destructive" role="alert">
                      {error}
                    </p>
                    <Link
                      href="/contact"
                      className="text-xs text-accent-strong underline-offset-3 hover:underline"
                    >
                      Message the atelier
                    </Link>
                  </div>
                ) : null
              }
              onDestinationChange={handleDestinationChange}
            />
            {isPending ? (
              <p className="text-xs text-muted-foreground">
                Estimating shipping…
              </p>
            ) : fee ? (
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-muted-foreground">
                  Delivery to {destination.city}, {destination.governorate}
                </span>
                <span className="font-medium text-foreground">
                  <Money value={fee.fee} />
                </span>
              </div>
            ) : null}
            <TextareaControl
              name="notes"
              label="Order notes (optional)"
              maxLength={1000}
              actionState={actionState}
            />
          </>
        )}
      </ShippingEstimate>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={!shippingFee}>
          Continue to payment
        </Button>
      </div>
    </section>
  );
}
