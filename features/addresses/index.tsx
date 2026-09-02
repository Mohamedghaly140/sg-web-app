import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AddressPanel } from "@/features/addresses/components/address-panel";
import { AddressList } from "@/features/addresses/components/address-list";
import type { AddressesSearchParams } from "@/features/addresses/hooks/addresses-search-params";
import { getAddresses } from "@/features/addresses/queries/get-addresses";
import { cn } from "@/lib/utils";

export type AddressesFeatureProps = {
  searchParams: AddressesSearchParams;
};

export default async function AddressesFeature({
  searchParams,
}: AddressesFeatureProps) {
  const addresses = await getAddresses();
  const requestedAddress = searchParams.address;
  const editAddress =
    requestedAddress && requestedAddress !== "new"
      ? addresses.find((address) => address.id === requestedAddress)
      : undefined;
  const panelTarget =
    requestedAddress === "new"
      ? ({ variant: "create" } as const)
      : editAddress
        ? ({ variant: "edit", address: editAddress } as const)
        : null;
  const countLabel = addresses.length === 1 ? "address" : "addresses";

  return (
    <div
      className={cn(
        "grid items-start gap-8",
        panelTarget && "lg:grid-cols-[minmax(0,1fr)_400px]",
      )}
    >
      <section className="flex min-w-0 flex-col gap-3">
        <header className="flex flex-col gap-2 border-b border-border pb-2">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="font-heading text-2xl font-normal text-foreground">
              Addresses
            </h1>
            <Button
              render={
                <Link
                  href={{
                    pathname: "/account/addresses",
                    query: { address: "new" },
                  }}
                  scroll={false}
                />
              }
              nativeButton={false}
            >
              + Add address
            </Button>
          </div>
          {/* The empty state below carries its own copy, so the count line
              would only repeat it at zero. */}
          {addresses.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              <span className="figures">{addresses.length}</span> {countLabel}{" "}
              saved. The default is used at checkout unless you choose another.
            </p>
          ) : null}
        </header>

        <AddressList addresses={addresses} />
      </section>

      {panelTarget ? (
        <aside aria-label="Address editor">
          {panelTarget.variant === "create" ? (
            <AddressPanel
              key={requestedAddress}
              variant="create"
              hasExistingAddresses={addresses.length > 0}
            />
          ) : (
            <AddressPanel
              key={requestedAddress}
              variant="edit"
              address={panelTarget.address}
              hasExistingAddresses={addresses.length > 0}
            />
          )}
        </aside>
      ) : null}
    </div>
  );
}
