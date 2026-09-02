"use client";

import { useIsMutating } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import type { OrderItem } from "@/features/checkout/types/order";

type OrderLineBuyAgainButtonProps = {
  item: OrderItem;
};

const UNAVAILABLE_CODES = new Set([
  "INSUFFICIENT_STOCK",
  "INVALID_VARIANT",
  "RESOURCE_NOT_FOUND",
]);

export function OrderLineBuyAgainButton({
  item,
}: OrderLineBuyAgainButtonProps) {
  // Every line's button shares one mutation key so the page can serialise them.
  // A guest reading /orders/track/[token] may have no cart at all: two adds
  // launched together would both read an empty `sg_cart_session`, mint two
  // anonymous carts server-side, and the second cookie write would strand the
  // first line in an unreachable cart behind two success toasts. The cart page
  // needs no such guard because a guest standing on it already holds the
  // cookie. See the guest-cart lifecycle in AGENTS.md.
  const addItem = useAddCartItem({ mutationKey: cartKeys.current });
  const isAnyLineAdding = useIsMutating({ mutationKey: cartKeys.current }) > 0;

  function handleBuyAgain() {
    addItem.mutate(
      {
        productId: item.productId,
        quantity: item.quantity,
        ...(item.color ? { color: item.color } : {}),
        ...(item.size ? { size: item.size } : {}),
      },
      {
        onSuccess(result) {
          if ("error" in result) {
            toast.error(
              UNAVAILABLE_CODES.has(result.error.code)
                ? "This piece is no longer available."
                : "Unable to add this piece to your bag.",
            );
            return;
          }

          toast.success("Added to your bag");
        },
        onError() {
          toast.error("Unable to add this piece to your bag.");
        },
      },
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={isAnyLineAdding}
      onClick={handleBuyAgain}
      className="w-fit"
    >
      {addItem.isPending ? "Adding…" : "Buy again"}
    </Button>
  );
}
