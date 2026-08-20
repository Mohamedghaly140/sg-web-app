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
import { WishlistItem } from "@/features/wishlist/components/wishlist-item";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";

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
    <ul className="divide-y divide-border bg-card ring-1 ring-foreground/10">
      {entries.map((entry) => (
        <WishlistItem entry={entry} key={entry.product.id} />
      ))}
    </ul>
  );
}
