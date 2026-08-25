"use client";

import { LucideHeart } from "lucide-react";

import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import { Button } from "@/components/ui/button";
import type { ProductSummary } from "@/features/products/types/product";
import { useWishlistToggleState } from "@/features/wishlist/hooks/use-wishlist-toggle-state";
import { cn } from "@/lib/utils";

type WishlistSaveButtonProps = {
  product: ProductSummary;
  className?: string;
};

/**
 * The product page's labelled wishlist control. Same behaviour as the card's
 * icon `WishlistHeart` — they share `useWishlistToggleState` — but rendered as
 * the design's block secondary button beneath Add to bag.
 */
export function WishlistSaveButton({
  product,
  className,
}: WishlistSaveButtonProps) {
  const { isWishlisted, disabled, toggle } = useWishlistToggleState(product);

  return (
    <RequireAuth
      title="Sign in to save items"
      description="Create an account or sign in to add products to your wishlist."
      trigger={
        <Button
          type="button"
          variant="secondary"
          size="lg"
          aria-pressed={isWishlisted}
          disabled={disabled}
          onClick={toggle}
          className={cn("w-full", className)}
        >
          <LucideHeart
            data-icon="inline-start"
            className={cn(isWishlisted && "fill-destructive text-destructive")}
          />
          {isWishlisted ? "Saved to wishlist" : "Save to wishlist"}
        </Button>
      }
    />
  );
}
