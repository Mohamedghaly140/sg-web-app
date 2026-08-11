"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useProductPurchase } from "@/features/products/components/product-purchase-provider";
import { formatEGP } from "@/lib/format";
import { cn } from "@/lib/utils";

type StickyAddToCartBarProps = {
  priceAfterDiscount: string;
  soldOut: boolean;
};

export function StickyAddToCartBar({
  priceAfterDiscount,
  soldOut: productSoldOut,
}: StickyAddToCartBarProps) {
  const [hasPassedActions, setHasPassedActions] = useState(false);
  const [isFooterNear, setIsFooterNear] = useState(false);
  const { addToCart, isAdding, isProductUnavailable } =
    useProductPurchase();
  const soldOut = productSoldOut || isProductUnavailable;

  useEffect(() => {
    const purchaseActions = document.querySelector(
      "[data-product-purchase-actions]",
    );

    if (!purchaseActions) {
      return;
    }

    const purchaseObserver = new IntersectionObserver(([entry]) => {
      setHasPassedActions(
        !entry.isIntersecting && entry.boundingClientRect.bottom <= 0,
      );
    });
    const footer = document.querySelector("footer");
    const footerObserver = footer
      ? new IntersectionObserver(
          ([entry]) => setIsFooterNear(entry.isIntersecting),
          { rootMargin: "0px 0px 80px 0px" },
        )
      : undefined;

    purchaseObserver.observe(purchaseActions);
    if (footer && footerObserver) {
      footerObserver.observe(footer);
    }

    return () => {
      purchaseObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  const isVisible = hasPassedActions && !isFooterNear;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur transition-transform motion-reduce:transition-none sm:hidden",
        isVisible
          ? "translate-y-0"
          : "pointer-events-none translate-y-full",
      )}
      aria-hidden={!isVisible}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <span className="mr-auto text-sm font-semibold text-foreground">
          {formatEGP(priceAfterDiscount)}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={addToCart}
          disabled={soldOut || isAdding}
        >
          {soldOut ? "Sold out" : isAdding ? "Adding…" : "Add to Cart"}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
