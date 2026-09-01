import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const addressesParsers = {
  address: parseAsString,
};

export const addressesSearchParamsCache =
  createSearchParamsCache(addressesParsers);

export type AddressesSearchParams = Awaited<
  ReturnType<typeof addressesSearchParamsCache.parse>
>;
