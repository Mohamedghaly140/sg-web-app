"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AddressForm } from "@/features/addresses/components/address-form";

export type CreateAddressSectionProps = {
  hasExistingAddresses: boolean;
};

export function CreateAddressSection({
  hasExistingAddresses,
}: CreateAddressSectionProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Add new address
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">New address</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <AddressForm
        variant="create"
        hasExistingAddresses={hasExistingAddresses}
        onDone={() => setOpen(false)}
      />
    </div>
  );
}
