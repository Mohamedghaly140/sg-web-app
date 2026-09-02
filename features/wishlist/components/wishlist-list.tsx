"use client";

import { LucideHeart, LucideTriangleAlert } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import Spinner from "@/components/shared/spinner";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ProductCard,
  PRODUCT_CARD_ACCOUNT_GRID_SIZES,
} from "@/features/products/components/product-card";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { formatDate } from "@/lib/format";

export function WishlistList() {
  const wishlistQuery = useWishlist();

  if (wishlistQuery.isPending) {
    return (
      <div
        className="flex min-h-64 items-center justify-center"
        role="status"
        aria-label="Loading wishlist"
      >
        <Spinner className="size-6" />
      </div>
    );
  }

  if (wishlistQuery.isError && !wishlistQuery.data) {
    return (
      <Alert variant="destructive">
        <LucideTriangleAlert />
        <AlertTitle>Unable to load your wishlist</AlertTitle>
        <AlertDescription>
          Check your connection, then try again.
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={wishlistQuery.isFetching}
            onClick={() => void wishlistQuery.refetch()}
          >
            {wishlistQuery.isFetching ? "Retrying…" : "Retry"}
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  const entries = wishlistQuery.data ?? [];

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<LucideHeart className="size-6" />}
        title="Your wishlist is empty"
        description="Save products you love and find them here later."
        action={
          <Button render={<Link href="/products" />} nativeButton={false}>
            Browse products
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {entries.map((entry) => (
        <ProductCard
          key={entry.product.id}
          product={entry.product}
          unavailable={!entry.available}
          imageSizes={PRODUCT_CARD_ACCOUNT_GRID_SIZES}
          meta={
            <p className="text-xs text-muted-foreground">
              Added {formatDate(entry.addedAt)}
            </p>
          }
        />
      ))}
    </div>
  );
}
