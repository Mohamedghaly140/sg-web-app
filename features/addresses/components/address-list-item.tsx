"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/features/addresses/components/address-form";
import { DeleteAddressButton } from "@/features/addresses/components/delete-address-button";
import { SetDefaultAddressButton } from "@/features/addresses/components/set-default-address-button";
import type { Address } from "@/features/addresses/types/address";

export type AddressListItemProps = {
  address: Address;
};

export function AddressListItem({ address }: AddressListItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Edit address</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
        <AddressForm
          variant="edit"
          address={address}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{address.alias}</p>
          {address.isDefault ? (
            <Badge variant="success">Default</Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground">
          {address.addressLine1}
          {address.details ? `, ${address.details}` : ""}
        </p>
        <p className="text-muted-foreground">
          {[address.area, address.city, address.governorate, address.country]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p className="text-muted-foreground">{address.phone}</p>
        {address.postalCode !== null ? (
          <p className="text-muted-foreground">
            Postal code: {address.postalCode}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
        {!address.isDefault ? (
          <SetDefaultAddressButton addressId={address.id} />
        ) : null}
        <DeleteAddressButton addressId={address.id} />
      </div>
    </li>
  );
}
