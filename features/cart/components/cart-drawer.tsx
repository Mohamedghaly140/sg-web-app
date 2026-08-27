"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Money } from "@/components/shared/money";
import Spinner from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartDrawerLine } from "@/features/cart/components/cart-drawer-line";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { fetchCurrentCart, useCart } from "@/features/cart/hooks/use-cart";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";

export function CartDrawer() {
  const { data: cart, isPending, isError, refetch } = useCart();
  const queryClient = useQueryClient();
  const inFlightItemIds = useRef(new Set<string>());
  const [pendingItemIds, setPendingItemIds] = useState<readonly string[]>([]);

  const finishRemoval = (itemId: string) => {
    if (inFlightItemIds.current.delete(itemId)) {
      setPendingItemIds(Array.from(inFlightItemIds.current));
    }
  };

  const removeCartItem = useRemoveCartItem({
    onSuccess: async (result, { itemId }) => {
      try {
        if (!("error" in result)) {
          return;
        }

        if (result.error.code === "RESOURCE_NOT_FOUND") {
          try {
            const recoveredCart = await fetchCurrentCart();
            queryClient.setQueryData(cartKeys.current, recoveredCart);
          } catch {
            // A stale delete is already successful from the user's perspective.
          }
          return;
        }

        toast.error(result.error.message);
      } finally {
        finishRemoval(itemId);
      }
    },
    onError: (error, { itemId }) => {
      toast.error(error.message);
      finishRemoval(itemId);
    },
  });

  const handleRemove = (itemId: string) => {
    if (inFlightItemIds.current.has(itemId)) {
      return;
    }

    inFlightItemIds.current.add(itemId);
    setPendingItemIds(Array.from(inFlightItemIds.current));
    removeCartItem.mutate({ itemId });
  };

  const items = cart?.items ?? [];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const itemLabel = itemCount === 1 ? "item" : "items";

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="default"
            size="sm"
            aria-label={`Cart, ${itemCount} ${itemLabel}`}
          />
        }
      >
        <LucideShoppingBag data-icon="inline-start" />
        Bag <span className="tabular-nums">· {itemCount}</span>
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 bg-background">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-lg font-normal">Your bag</SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? "Your bag is empty."
              : `${itemCount} ${itemLabel} in your cart.`}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isPending ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : isError ? (
            <EmptyState
              icon={<LucideTriangleAlert />}
              title="We couldn't load your cart"
              description="Check your connection and try again."
              action={
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<LucideShoppingBag />}
              title="Your bag is empty"
              description="Nothing here yet. The new-in pieces are a good place to start — twelve dresses, eight abayas, six sets."
              action={
                <SheetClose
                  nativeButton={false}
                  render={
                    <Button
                      render={<Link href="/products" />}
                      nativeButton={false}
                      size="sm"
                    />
                  }
                >
                  Continue shopping
                </SheetClose>
              }
            />
          ) : (
            items.map(item => (
              <CartDrawerLine
                key={item.id}
                item={item}
                isRemoving={pendingItemIds.includes(item.id)}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {cart !== undefined && items.length > 0 ? (
          <SheetFooter className="border-t border-border">
            <div className="flex items-center justify-between gap-4 text-muted-foreground figures">
              <span>Cart total</span>
              <span><Money value={cart.totalCartPrice} /></span>
            </div>
            <div className="flex items-center justify-between gap-4 font-heading text-base font-normal text-foreground figures">
              <span>Total after discount</span>
              <span><Money value={cart.totalPriceAfterDiscount} /></span>
            </div>
            <SheetClose
              nativeButton={false}
              render={
                <Button
                  render={<Link href="/cart" />}
                  nativeButton={false}
                  variant="outline"
                  className="w-full"
                />
              }
            >
              View cart
            </SheetClose>
            <Button type="button" className="w-full" disabled>
              Proceed to Checkout
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Checkout is coming soon.
            </p>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
