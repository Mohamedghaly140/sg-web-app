"use client";

import { LucideTrash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClearCart } from "@/features/cart/hooks/use-clear-cart";
import { isSameDecimal } from "@/lib/format";

type CartSummaryProps = {
  totalCartPrice: string;
  totalPriceAfterDiscount: string;
  disableClear: boolean;
  onClearSuccess: () => void;
};

export function CartSummary({
  totalCartPrice,
  totalPriceAfterDiscount,
  disableClear,
  onClearSuccess,
}: CartSummaryProps) {
  const hasSavings = !isSameDecimal(
    totalCartPrice,
    totalPriceAfterDiscount,
  );
  const clearCart = useClearCart({
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error.message);
        return;
      }

      onClearSuccess();
      toast.success("Cart cleared.");
    },
    onError: (error) => {
      toast.error(error.message || "Unable to clear the cart.");
    },
  });

  return (
    <aside aria-labelledby="cart-summary-heading" className="lg:sticky lg:top-6">
      <Card>
        <CardHeader>
          <CardTitle id="cart-summary-heading">Order summary</CardTitle>
          <CardDescription>
            Totals are confirmed by the store after every cart change.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd><Money value={totalCartPrice} /></dd>
            </div>
            {hasSavings ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">You save</dt>
                <dd>
                  <Badge variant="success">Discount applied</Badge>
                </dd>
              </div>
            ) : null}
            <Separator />
            <div className="flex items-end justify-between gap-4">
              <dt className="font-medium text-foreground">Total</dt>
              <dd className="text-xl font-semibold tracking-tight text-foreground">
                <Money value={totalPriceAfterDiscount} />
              </dd>
            </div>
          </dl>

          <Button render={<Link href="/checkout" />} nativeButton={false}>
            Proceed to Checkout
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disableClear || clearCart.isPending}
              >
                <LucideTrash2 data-icon="inline-start" />
                {clearCart.isPending ? "Clearing…" : "Clear cart"}
              </Button>
            }
            title="Clear your cart?"
            description="Every item will be removed from your cart. This cannot be undone."
            confirmLabel="Clear cart"
            variant="destructive"
            onConfirm={() => clearCart.mutate()}
          />
        </CardFooter>
      </Card>
    </aside>
  );
}
