"use client";

import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

import type { ProductSummary } from "@/features/products/types/product";
import { useToggleWishlist } from "@/features/wishlist/hooks/use-toggle-wishlist";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";

export type WishlistToggleState = {
  isWishlisted: boolean;
  /** True while the mutation is in flight or the wishlist has not hydrated. */
  disabled: boolean;
  toggle: () => void;
};

/**
 * Shared wishlist toggle wiring for every control that saves a product — the
 * card's icon heart and the product page's labelled "Save to wishlist" button.
 * Both must agree on hydration gating and optimistic state, so it lives here
 * rather than being inlined twice.
 */
export function useWishlistToggleState(
  product: ProductSummary,
): WishlistToggleState {
  const { isSignedIn } = useAuth();
  const { data } = useWishlist();
  const isWishlisted = (data ?? []).some(
    (entry) => entry.product.id === product.id,
  );
  const toggleWishlist = useToggleWishlist(
    (message) => toast.error(message),
    (nowWishlisted) =>
      toast.success(
        nowWishlisted ? "Added to wishlist" : "Removed from wishlist",
      ),
  );
  // useWishlist()'s query is disabled while signed out, so `data` never
  // resolves away from undefined in that case — only gate on hydration once
  // we know the visitor is signed in; a confirmed-signed-out visitor must
  // stay clickable so RequireAuth's trigger can open the sign-in prompt.
  const notHydrated = isSignedIn !== false && data === undefined;

  function toggle() {
    if (toggleWishlist.isPending) return;
    if (notHydrated) return;
    toggleWishlist.mutate({ product, isWishlisted });
  }

  return {
    isWishlisted,
    disabled: toggleWishlist.isPending || notHydrated,
    toggle,
  };
}
