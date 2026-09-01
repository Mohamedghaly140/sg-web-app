"use client";

import { LucideX } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Money } from "@/components/shared/money";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddressForm } from "@/features/addresses/components/address-form";
import { useAddressesParams } from "@/features/addresses/hooks/use-addresses-params";
import type { Address } from "@/features/addresses/types/address";
import { ShippingEstimate } from "@/features/shipping/components/shipping-estimate";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

type AddressPanelCreateProps = {
  variant: "create";
  hasExistingAddresses: boolean;
};

type AddressPanelEditProps = {
  variant: "edit";
  address: Address;
  hasExistingAddresses: boolean;
};

export type AddressPanelProps =
  | AddressPanelCreateProps
  | AddressPanelEditProps;

type AddressPanelDestination = {
  country: string;
  governorate: string;
  city: string;
};

export function AddressPanel(props: AddressPanelProps) {
  const [, setParams] = useAddressesParams();
  const [destination, setDestination] = useState<AddressPanelDestination>({
    country: DEFAULT_COUNTRY,
    governorate:
      props.variant === "edit" ? props.address.governorate : "",
    city: props.variant === "edit" ? props.address.city : "",
  });

  const handleClose = useCallback(() => {
    void setParams({ address: null });
  }, [setParams]);

  const handleDestinationChange = useCallback(
    (next: AddressPanelDestination) => {
      setDestination(next);
    },
    [],
  );

  const handleResolved = useCallback(() => {}, []);

  const title =
    props.variant === "create"
      ? "Add address"
      : `Edit “${props.address.alias}”`;

  return (
    <Card className="gap-3">
      <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <CardTitle className="font-heading text-[19px] font-normal">
          {title}
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close address panel"
          onClick={handleClose}
        >
          <LucideX aria-hidden="true" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <ShippingEstimate
          country={destination.country}
          governorate={destination.governorate}
          city={destination.city}
          onResolved={handleResolved}
        >
          {({ isPending, fee, error }) => (
            <AddressForm
              {...(props.variant === "create"
                ? {
                    variant: "create" as const,
                    hasExistingAddresses: props.hasExistingAddresses,
                  }
                : {
                    variant: "edit" as const,
                    address: props.address,
                  })}
              layout="grid"
              columns={2}
              className="gap-3"
              onDestinationChange={handleDestinationChange}
              onDone={handleClose}
              footer={
                <>
                  {error ? (
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
                  ) : isPending ? (
                    <p className="text-xs text-muted-foreground">
                      Estimating shipping…
                    </p>
                  ) : fee ? (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Delivery here
                      </span>
                      <span className="font-medium text-foreground">
                        <Money value={fee.fee} />
                      </span>
                    </div>
                  ) : null}
                  <Separator />
                </>
              }
              actions={
                <div className="flex gap-2">
                  <SubmitButton label="Save address" className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </div>
              }
            />
          )}
        </ShippingEstimate>

        <p className="measure text-2xs text-muted-foreground">
          To change which address is the default, use “Make default” in the
          list — it moves the default in one step instead of leaving you
          without one.
        </p>
      </CardContent>
    </Card>
  );
}
