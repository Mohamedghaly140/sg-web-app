"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import type { ProductSummary } from "@/features/products/types/product";
import { addToWishlistAction } from "@/features/wishlist/actions/add-to-wishlist";
import { removeFromWishlistAction } from "@/features/wishlist/actions/remove-from-wishlist";
import { wishlistKeys } from "@/features/wishlist/hooks/wishlist-keys";
import type {
  AddToWishlistResult,
  RemoveFromWishlistResult,
  Wishlist,
  WishlistEntry,
} from "@/features/wishlist/types/wishlist";

export type ToggleWishlistVariables = {
  product: ProductSummary;
  isWishlisted: boolean;
};

export function useToggleWishlist(
  onRolledBack?: (message: string) => void,
): UseMutationResult<
  AddToWishlistResult | RemoveFromWishlistResult,
  Error,
  ToggleWishlistVariables
> {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const key = wishlistKeys.current(userId ?? "anonymous");

  function applyToggle(product: ProductSummary, isWishlisted: boolean) {
    queryClient.setQueryData<Wishlist>(key, (current) => {
      const base = current ?? [];
      return isWishlisted
        ? base.filter((entry) => entry.product.id !== product.id)
        : [
            {
              product,
              addedAt: new Date().toISOString(),
              available: true,
            } satisfies WishlistEntry,
            ...base.filter((entry) => entry.product.id !== product.id),
          ];
    });
  }

  function revertToggle(product: ProductSummary, isWishlisted: boolean) {
    // Reverse only this mutation's own optimistic change to this one product,
    // never a whole-list snapshot restore: a snapshot from before this
    // mutation started can be stale relative to a different, concurrently
    // succeeding toggle on another product sharing the same cache key.
    applyToggle(product, !isWishlisted);
  }

  return useMutation({
    retry: 0,
    mutationFn: async ({
      product,
      isWishlisted,
    }): Promise<AddToWishlistResult | RemoveFromWishlistResult> =>
      isWishlisted
        ? removeFromWishlistAction({ productId: product.id })
        : addToWishlistAction({ productId: product.id }),
    onMutate: async ({ product, isWishlisted }) => {
      await queryClient.cancelQueries({ queryKey: key });
      applyToggle(product, isWishlisted);
    },
    onError: (_error, { product, isWishlisted }) => {
      revertToggle(product, isWishlisted);
      onRolledBack?.("Something went wrong. Please try again.");
    },
    onSuccess: (result, { product, isWishlisted }) => {
      if (!("error" in result)) return;
      revertToggle(product, isWishlisted);
      onRolledBack?.(
        result.error.code === "RESOURCE_NOT_FOUND"
          ? "This product is no longer available."
          : result.error.message,
      );
    },
    onSettled: () => {
      if (pathname === "/account/wishlist") {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
