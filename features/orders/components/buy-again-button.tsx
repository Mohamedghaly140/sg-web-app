"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBuyAgain } from "@/features/orders/hooks/use-buy-again";

type BuyAgainButtonProps = {
  orderId: string;
};

export function BuyAgainButton({ orderId }: BuyAgainButtonProps) {
  const buyAgain = useBuyAgain();

  function handleBuyAgain() {
    buyAgain.mutate(
      { orderId },
      {
        onSuccess(result) {
          if ("error" in result) {
            toast.error(result.error.message);
            return;
          }

          // `added`, `total` and `skipped` all count distinct order lines, so
          // the copy says "lines" — the same rule `itemsCount` follows.
          const lines = result.total === 1 ? "line" : "lines";

          if (result.failure) {
            toast.error(
              result.added > 0
                ? `Added ${result.added} of ${result.total} ${lines}, then stopped — ${result.failure.message}`
                : result.failure.message,
            );
            return;
          }

          if (result.skipped.length > 0) {
            toast.success(
              `Added ${result.added} of ${result.total} ${lines} — the rest are unavailable`,
            );
            return;
          }

          toast.success("Added to your bag");
        },
        onError(error) {
          toast.error(error.message || "Unable to add this order to your bag.");
        },
      },
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={buyAgain.isPending}
      onClick={handleBuyAgain}
    >
      {buyAgain.isPending ? "Adding…" : "Buy again"}
    </Button>
  );
}
