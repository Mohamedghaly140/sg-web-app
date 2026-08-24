import { LucideCircleCheck } from "lucide-react";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { isSameDecimal } from "@/lib/format";

export type OrderConfirmationProps = {
  humanOrderId: string;
  isGuest: boolean;
  orderId?: string;
  itemsSubtotal: string;
  discountApplied: string;
  shippingFees: string;
  totalOrderPrice: string;
};

export function OrderConfirmation({
  humanOrderId,
  isGuest,
  orderId,
  itemsSubtotal,
  discountApplied,
  shippingFees,
  totalOrderPrice,
}: OrderConfirmationProps) {
  const hasDiscount = !isSameDecimal(discountApplied, "0");

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <LucideCircleCheck className="size-12 text-primary" />
      <h1 className="font-heading text-2xl font-semibold text-foreground">Order placed</h1>
      <p className="text-muted-foreground">
        Order <span className="font-medium text-foreground">{humanOrderId}</span> is confirmed.
      </p>
      {isGuest ? (
        <p className="max-w-md text-sm text-muted-foreground">
          We emailed your order confirmation and tracking link to the address you provided.
        </p>
      ) : null}
      <dl className="w-full max-w-sm flex flex-col gap-2 text-left text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Items subtotal</dt>
          <dd><Money value={itemsSubtotal} /></dd>
        </div>
        {hasDiscount ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd>-<Money value={discountApplied} /></dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd><Money value={shippingFees} /></dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="text-lg font-semibold text-foreground">
            <Money value={totalOrderPrice} />
          </dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <Button render={<Link href="/products" />} nativeButton={false}>
          Continue shopping
        </Button>
        {!isGuest && orderId ? (
          <Button
            variant="outline"
            render={<Link href={`/account/orders/${orderId}`} />}
            nativeButton={false}
          >
            View order
          </Button>
        ) : null}
      </div>
    </div>
  );
}
