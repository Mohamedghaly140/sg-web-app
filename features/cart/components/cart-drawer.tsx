"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
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
import { formatEGP } from "@/lib/format";

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
      <span className="relative inline-flex">
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Cart, ${itemCount} ${itemLabel}`}
            />
          }
        >
          <LucideShoppingBag />
        </SheetTrigger>
        {itemCount > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-primary-foreground"
          >
            {itemCount}
          </span>
        ) : null}
      </span>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {itemCount === 0
              ? "Your cart is empty."
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
              title="Your cart is empty"
              description="Explore the collection and add something you love."
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
          <SheetFooter>
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span>Cart total</span>
              <span>{formatEGP(cart.totalCartPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm font-medium text-foreground">
              <span>Total after discount</span>
              <span>{formatEGP(cart.totalPriceAfterDiscount)}</span>
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
