"use client";

import { useQueryStates } from "nuqs";

import { productsParsers } from "@/features/products/hooks/products-search-params";

export type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";

export function useProductsParams() {
  return useQueryStates(productsParsers, { shallow: false });
}
