"use client";

import { useQueryStates } from "nuqs";

import { ordersParsers } from "@/features/orders/hooks/orders-search-params";

export type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";

export function useOrdersParams() {
  return useQueryStates(ordersParsers, { shallow: false });
}
