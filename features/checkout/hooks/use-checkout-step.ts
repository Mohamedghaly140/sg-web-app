"use client";

import { useQueryStates } from "nuqs";

import { checkoutParamsParsers } from "@/features/checkout/hooks/checkout-search-params";

export function useCheckoutStep() {
  return useQueryStates(checkoutParamsParsers, { shallow: false });
}
