"use client";

import Link from "next/link";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartCouponForm } from "@/features/cart/components/cart-coupon-form";
import { useClearCart } from "@/features/cart/hooks/use-clear-cart";
import { isSameDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

type CartClearButtonProps = {
  disabled: boolean;
  onSuccess: () => void;
};

type CartSummaryProps = {
  totalCartPrice: string;
  totalPriceAfterDiscount: string;
};

export function CartClearButton({
  disabled,
  onSuccess,
}: CartClearButtonProps) {
  const clearCart = useClearCart({
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error.message);
        return;
      }

      onSuccess();
      toast.success("Cart cleared.");
    },
    onError: (error) => {
      toast.error(error.message || "Unable to clear the cart.");
    },
  });

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || clearCart.isPending}
        >
          {clearCart.isPending ? "Clearing…" : "Clear bag"}
        </Button>
      }
      title="Clear your cart?"
      description="Every item will be removed from your cart. This cannot be undone."
      confirmLabel="Clear cart"
      variant="destructive"
      onConfirm={() => clearCart.mutate()}
    />
  );
}

export function CartSummary({
  totalCartPrice,
  totalPriceAfterDiscount,
}: CartSummaryProps) {
  const hasSavings = !isSameDecimal(
    totalCartPrice,
    totalPriceAfterDiscount,
  );

  return (
    <aside aria-labelledby="cart-summary-heading" className="lg:sticky lg:top-6">
      <Card className="gap-3 shadow-none [--card-spacing:--spacing(3)]">
        <CardHeader className="pb-0">
          <CardTitle id="cart-summary-heading" className="font-normal">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CartCouponForm />
          <Separator className="my-1" />
          <dl className="flex flex-col gap-1.5 text-[13px] figures">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Before discounts</dt>
              <dd
                className={cn(
                  "text-muted-foreground",
                  hasSavings && "line-through",
                )}
              >
                <Money value={totalCartPrice} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Items subtotal</dt>
              <dd>
                <Money value={totalPriceAfterDiscount} />
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-right">calculated at checkout</dd>
            </div>
          </dl>
          <Separator className="my-1" />
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-heading text-lg font-normal">Subtotal</span>
            <span className="font-heading text-[21px] font-normal figures">
              <Money value={totalPriceAfterDiscount} />
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2 border-t-0 pt-0">
          <Button
            render={<Link href="/checkout" />}
            nativeButton={false}
            size="lg"
            className="w-full"
          >
            Checkout
          </Button>
          <p className="measure max-w-none text-2xs text-muted-foreground">
            Stock is reserved when the order is placed, not while it sits in
            your bag. Guest bags are kept for seven days.
          </p>
        </CardFooter>
      </Card>
    </aside>
  );
}
