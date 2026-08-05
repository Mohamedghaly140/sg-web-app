"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContext } from "react";

import { CartInitialDataContext } from "@/features/cart/components/cart-initial-data-provider";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import type { Cart } from "@/features/cart/types/cart";
import { ApiError } from "@/lib/api/api-error";

export async function fetchCurrentCart(signal?: AbortSignal): Promise<Cart> {
  const response = await fetch("/api/cart", {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const error =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null
        ? payload.error
        : null;
    const code =
      error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;
    const message =
      error !== null && "message" in error && typeof error.message === "string"
        ? error.message
        : undefined;

    throw new ApiError(
      response.status,
      code ?? "UNKNOWN",
      message ?? "Unable to load the cart.",
    );
  }

  return (await response.json()) as Cart;
}

export function useCart(initialData?: Cart): UseQueryResult<Cart, Error> {
  const contextInitialData = useContext(CartInitialDataContext);

  return useQuery({
    queryKey: cartKeys.current,
    queryFn: ({ signal }) => fetchCurrentCart(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    initialData: initialData ?? contextInitialData,
  });
}
