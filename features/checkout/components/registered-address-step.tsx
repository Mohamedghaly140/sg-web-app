"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { RadioDot } from "@/components/shared/radio-dot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddressForm } from "@/features/addresses/components/address-form";
import type { Address } from "@/features/addresses/types/address";
import { ShippingEstimate } from "@/features/checkout/components/shipping-estimate";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

export type RegisteredAddressStepProps = {
  active: boolean;
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
  onFeeChange: (fee: ShippingFee | null) => void;
  onNext: () => void;
};

export function RegisteredAddressStep({
  active,
  addresses,
  selectedId,
  onSelect,
  onFeeChange,
  onNext,
}: RegisteredAddressStepProps) {
  const router = useRouter();
  const [showCreateAddress, setShowCreateAddress] = useState(addresses.length === 0);
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const selectedAddress = addresses.find((address) => address.id === selectedId) ?? null;

  const handleResolved = useCallback(
    (fee: ShippingFee | null) => {
      setShippingFee(fee);
      onFeeChange(fee);
    },
    [onFeeChange],
  );

  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Shipping address">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Shipping address
      </h2>
      {addresses.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          {addresses.map((address) => {
            const selected = selectedId === address.id;

            return (
              <Card key={address.id} data-selected={selected} className="p-0">
                <label className="flex items-start gap-3 p-3 text-sm">
                  <input
                    type="radio"
                    name="shippingAddressId"
                    value={address.id}
                    checked={selected}
                    onChange={() => onSelect(address.id)}
                    className="peer sr-only"
                  />
                  <RadioDot selected={selected} className="mt-0.5" />
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{address.alias}</span>
                    <span className="text-muted-foreground">
                      {address.addressLine1}, {address.area}, {address.city},{" "}
                      {address.governorate}
                    </span>
                  </span>
                </label>
              </Card>
            );
          })}
        </fieldset>
      ) : null}

      <Sheet open={showCreateAddress} onOpenChange={setShowCreateAddress}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
            />
          }
        >
          Add a new address
        </SheetTrigger>
        <SheetContent className="data-[side=right]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add a new address</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <AddressForm
              variant="create"
              hasExistingAddresses={addresses.length > 0}
              onDone={() => {
                setShowCreateAddress(false);
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {selectedAddress ? (
        <ShippingEstimate
          country={DEFAULT_COUNTRY}
          governorate={selectedAddress.governorate}
          city={selectedAddress.city}
          onResolved={handleResolved}
        />
      ) : null}

      <Button
        type="button"
        onClick={onNext}
        disabled={!selectedId || !shippingFee}
        className="self-end"
      >
        Continue to payment
      </Button>
    </section>
  );
}
