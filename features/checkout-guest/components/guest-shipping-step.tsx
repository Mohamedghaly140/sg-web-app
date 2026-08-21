"use client";

import { useCallback, useState } from "react";

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
};

export function GuestShippingStep({
  active,
  actionState,
  onNext,
  onBack,
  onFeeChange,
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

  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Shipping address">
      <AddressFormFields
        mode="guest"
        namePrefix="shipping"
        actionState={actionState}
        onDestinationChange={handleDestinationChange}
      />
      <TextareaControl
        name="notes"
        label="Order notes (optional)"
        maxLength={1000}
        actionState={actionState}
      />
      <ShippingEstimate
        country={destination.country}
        governorate={destination.governorate}
        city={destination.city}
        onResolved={handleResolved}
      />
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!shippingFee}>
          Continue to review
        </Button>
      </div>
    </section>
  );
}
