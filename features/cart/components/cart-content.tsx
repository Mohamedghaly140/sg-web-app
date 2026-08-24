"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import Spinner from "@/components/shared/spinner";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/features/cart/components/cart-line-item";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { useCartErrorState } from "@/features/cart/hooks/use-cart-error-state";
import { fetchCurrentCart, useCart } from "@/features/cart/hooks/use-cart";
import type { CartActionResult, CartItem } from "@/features/cart/types/cart";

export function CartContent() {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const { getError, setError, clearError, clearErrors } = useCartErrorState();
  const [inFlightItemIds, setInFlightItemIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const recoveryPromise = useRef<Promise<void> | null>(null);

  const beginItemMutation = useCallback(
    (itemId: string) => {
      if (inFlightItemIds.has(itemId)) {
        return false;
      }

      clearError(itemId);
      setInFlightItemIds((current) => new Set(current).add(itemId));
      return true;
    },
    [clearError, inFlightItemIds],
  );

  const endItemMutation = useCallback((itemId: string) => {
    setInFlightItemIds((current) => {
      if (!current.has(itemId)) {
        return current;
      }

      const next = new Set(current);
      next.delete(itemId);
      return next;
    });
  }, []);

  const recoverMissingLine = useCallback(() => {
    if (recoveryPromise.current) {
      return recoveryPromise.current;
    }

    const recovery = (async () => {
      try {
        const cart = await fetchCurrentCart();
        queryClient.setQueryData(cartKeys.current, cart);
      } catch {
        toast.error("The cart changed, but it could not be refreshed. Try again.");
      } finally {
        recoveryPromise.current = null;
      }
    })();

    recoveryPromise.current = recovery;
    return recovery;
  }, [queryClient]);

  const handleLineMutationResult = useCallback(
    async (item: CartItem, result: CartActionResult) => {
      try {
        if (!("error" in result)) {
          clearError(item.id);
          return;
        }

        if (result.error.code === "RESOURCE_NOT_FOUND") {
          clearError(item.id);
          await recoverMissingLine();
          return;
        }

        setError(item.id, result.error);

        if (
          result.error.code !== "INSUFFICIENT_STOCK" &&
          result.error.code !== "VALIDATION_ERROR"
        ) {
          toast.error(result.error.message);
        }
      } finally {
        endItemMutation(item.id);
      }
    },
    [clearError, endItemMutation, recoverMissingLine, setError],
  );

  const handleUnexpectedLineError = useCallback(
    (itemId: string, error: Error) => {
      toast.error(error.message || "Unable to update the cart.");
      endItemMutation(itemId);
    },
    [endItemMutation],
  );

  if (cartQuery.isPending) {
    return (
      <div
        className="flex min-h-64 items-center justify-center"
        role="status"
        aria-label="Loading cart"
      >
        <Spinner className="size-6" />
      </div>
    );
  }

  if (cartQuery.isError && !cartQuery.data) {
    return (
      <Alert variant="destructive">
        <LucideTriangleAlert />
        <AlertTitle>Unable to load your cart</AlertTitle>
        <AlertDescription>
          Check your connection, then try again.
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cartQuery.isFetching}
            onClick={() => void cartQuery.refetch()}
          >
            {cartQuery.isFetching ? "Retrying…" : "Retry"}
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  const cart = cartQuery.data;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6" />}
        title="Your cart is empty"
        description="Explore the collection and add something you love."
        action={
          <Button
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Continue shopping
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" className="sr-only">
          Cart items
        </h2>
        <ul className="border border-border bg-card shadow-sm">
          {cart.items.map((item, index) => (
            <CartLineItem
              key={item.id}
              item={item}
              error={getError(item.id)}
              isInFlight={inFlightItemIds.has(item.id)}
              showSeparator={index < cart.items.length - 1}
              onBeginMutation={beginItemMutation}
              onMutationResult={handleLineMutationResult}
              onUnexpectedError={handleUnexpectedLineError}
            />
          ))}
        </ul>
      </section>
      <CartSummary
        totalCartPrice={cart.totalCartPrice}
        totalPriceAfterDiscount={cart.totalPriceAfterDiscount}
        disableClear={inFlightItemIds.size > 0}
        onClearSuccess={clearErrors}
      />
    </div>
  );
}
