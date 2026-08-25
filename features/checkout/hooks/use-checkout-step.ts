"use client";

import { useQueryStates } from "nuqs";

import {
  guestCheckoutParamsParsers,
  registeredCheckoutParamsParsers,
} from "@/features/checkout/hooks/checkout-search-params";

export function useGuestCheckoutStep() {
  return useQueryStates(guestCheckoutParamsParsers, { shallow: false });
}

export function useRegisteredCheckoutStep() {
  return useQueryStates(registeredCheckoutParamsParsers, { shallow: false });
}
