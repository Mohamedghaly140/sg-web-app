import type { Metadata } from "next";

import AddressesFeature from "@/features/addresses";
import { addressesSearchParamsCache } from "@/features/addresses/hooks/addresses-search-params";

export const metadata: Metadata = {
  title: "Addresses",
};

type AddressesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AddressesPage({
  searchParams,
}: AddressesPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedSearchParams =
    await addressesSearchParamsCache.parse(resolvedSearchParams);

  return <AddressesFeature searchParams={parsedSearchParams} />;
}
