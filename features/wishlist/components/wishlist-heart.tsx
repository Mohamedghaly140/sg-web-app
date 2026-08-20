"use client";

import { LucideHeart } from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import { Button } from "@/components/ui/button";
import type { ProductSummary } from "@/features/products/types/product";
import { useToggleWishlist } from "@/features/wishlist/hooks/use-toggle-wishlist";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { cn } from "@/lib/utils";

type WishlistHeartProps = {
  product: ProductSummary;
  className?: string;
};

export function WishlistHeart({ product, className }: WishlistHeartProps) {
  const { data } = useWishlist();
  const isWishlisted = (data ?? []).some(
    (entry) => entry.product.id === product.id,
  );
  const toggle = useToggleWishlist((message) => toast.error(message));

  function handleClick() {
    if (toggle.isPending) return;
    if (data === undefined) return;
    toggle.mutate({ product, isWishlisted });
  }

  return (
    <RequireAuth
      title="Sign in to save items"
      description="Create an account or sign in to add products to your wishlist."
      trigger={
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          disabled={toggle.isPending || data === undefined}
          onClick={handleClick}
          className={className}
        >
          <LucideHeart
            data-icon="inline-start"
            className={cn(
              isWishlisted && "fill-destructive text-destructive",
            )}
          />
        </Button>
      }
    />
  );
}
