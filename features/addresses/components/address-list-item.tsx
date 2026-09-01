import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DeleteAddressButton } from "@/features/addresses/components/delete-address-button";
import { SetDefaultAddressButton } from "@/features/addresses/components/set-default-address-button";
import type { Address } from "@/features/addresses/types/address";
import { formatDayMonth } from "@/lib/format";

export type AddressListItemProps = {
  address: Address;
};

export function AddressListItem({ address }: AddressListItemProps) {
  const primaryLine = [
    address.addressLine1,
    address.area,
    address.city,
    address.governorate,
    address.country,
  ].join(", ");

  return (
    <li>
      <Card
        size="sm"
        data-selected={address.isDefault ? true : undefined}
      >
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
          <p className="font-heading text-[19px] leading-tight font-normal">
            {address.alias}
          </p>
          {address.isDefault ? (
            <Badge variant="accent">Default</Badge>
          ) : (
            <span className="figures text-[11.5px] text-muted-foreground">
              Added {formatDayMonth(address.createdAt)}
            </span>
          )}
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            {primaryLine}
            {address.postalCode !== null ? (
              <>
                {" · "}
                <span className="figures">{address.postalCode}</span>
              </>
            ) : null}
            <br />
            {address.details} ·{" "}
            <span className="figures">{address.phone}</span>
          </p>
        </CardContent>

        <CardFooter className="gap-2 border-t-0 pt-0">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href={{
                  pathname: "/account/addresses",
                  query: { address: address.id },
                }}
                scroll={false}
              />
            }
            nativeButton={false}
          >
            Edit
          </Button>
          {address.isDefault ? (
            <Button type="button" variant="ghost" size="sm" disabled>
              Already default
            </Button>
          ) : (
            <SetDefaultAddressButton addressId={address.id} />
          )}
          <DeleteAddressButton addressId={address.id} className="ml-auto" />
        </CardFooter>
      </Card>
    </li>
  );
}
