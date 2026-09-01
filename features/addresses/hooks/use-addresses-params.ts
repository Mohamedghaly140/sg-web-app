"use client";

import { useQueryStates } from "nuqs";

import { addressesParsers } from "@/features/addresses/hooks/addresses-search-params";

export function useAddressesParams() {
  return useQueryStates(addressesParsers, { shallow: false });
}
