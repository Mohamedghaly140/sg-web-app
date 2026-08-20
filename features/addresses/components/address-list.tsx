import { LucideMapPin } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { AddressListItem } from "@/features/addresses/components/address-list-item";
import type { Address } from "@/features/addresses/types/address";

export type AddressListProps = {
  addresses: Address[];
};

export function AddressList({ addresses }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <EmptyState
        icon={
          <LucideMapPin className="size-6 text-muted-foreground" aria-hidden />
        }
        title="No saved addresses"
        description="Add an address to use at checkout."
      />
    );
  }

  // Render API order as received (default first, then newest). Never
  // client-re-sort — including after delete promotes a new default; trust
  // revalidatePath + the next server read.
  return (
    <ul className="divide-y divide-border bg-card ring-1 ring-foreground/10">
      {addresses.map((address) => (
        <AddressListItem key={address.id} address={address} />
      ))}
    </ul>
  );
}
