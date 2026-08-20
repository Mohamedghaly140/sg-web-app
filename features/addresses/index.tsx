import { CreateAddressSection } from "@/features/addresses/components/create-address-section";
import { AddressList } from "@/features/addresses/components/address-list";
import { getAddresses } from "@/features/addresses/queries/get-addresses";

export default async function AddressesFeature() {
  const addresses = await getAddresses();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Addresses
      </h1>
      <CreateAddressSection hasExistingAddresses={addresses.length > 0} />
      <AddressList addresses={addresses} />
    </div>
  );
}
