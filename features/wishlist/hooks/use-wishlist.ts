"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useContext } from "react";

import { WishlistInitialDataContext } from "@/features/wishlist/components/wishlist-initial-data-provider";
import { wishlistKeys } from "@/features/wishlist/hooks/wishlist-keys";
import type { Wishlist } from "@/features/wishlist/types/wishlist";
import { ApiError } from "@/lib/api/api-error";

export async function fetchCurrentWishlist(
  signal?: AbortSignal,
): Promise<Wishlist> {
  const response = await fetch("/api/wishlist", {
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
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : undefined;

    throw new ApiError(
      response.status,
      code ?? "UNKNOWN",
      message ?? "Unable to load the wishlist.",
    );
  }

  return (await response.json()) as Wishlist;
}

export function useWishlist(): UseQueryResult<Wishlist, Error> {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const contextInitial = useContext(WishlistInitialDataContext);
  const key = wishlistKeys.current(userId ?? "anonymous");
  const contextSeed =
    contextInitial?.userId === userId ? contextInitial?.wishlist : undefined;

  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => fetchCurrentWishlist(signal),
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    initialData: contextSeed,
  });
}
