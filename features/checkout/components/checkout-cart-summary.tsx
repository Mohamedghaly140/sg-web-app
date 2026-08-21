import { LucideTriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Cart } from "@/features/cart/types/cart";
import type { StockErrorEntry, VariantErrorEntry } from "@/lib/api/api-error";
import { cldUrl, formatEGP } from "@/lib/format";

export type CheckoutCartSummaryProps = {
  cart: Cart;
  variantErrors?: VariantErrorEntry[];
  stockErrors?: StockErrorEntry[];
};

export function CheckoutCartSummary({
  cart,
  variantErrors = [],
  stockErrors = [],
}: CheckoutCartSummaryProps) {
  const needsAttention =
    variantErrors.length > 0 ||
    stockErrors.length > 0 ||
    cart.items.some(
      (item) => item.product.status !== "ACTIVE" || item.quantity > item.product.quantity,
    );

  return (
    <div className="flex flex-col gap-4">
      {needsAttention ? (
        <Alert variant="destructive">
          <LucideTriangleAlert />
          <AlertTitle>Some items in your cart need attention</AlertTitle>
          <AlertDescription>
            <Link href="/cart" className="underline">
              Review your cart
            </Link>{" "}
            before placing your order.
          </AlertDescription>
        </Alert>
      ) : null}

      <ul className="flex flex-col divide-y divide-border">
        {cart.items.map((item) => {
          const variantMatch = variantErrors.find(
            (entry) => entry.productId === item.product.id,
          );
          const stockMatch = stockErrors.find(
            (entry) => entry.productId === item.product.id,
          );

          return (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={cldUrl(item.product.imageUrl, { width: 128, height: 128, crop: "fill" })}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.product.name}
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.color ? <Badge variant="outline">{item.color}</Badge> : null}
                  {item.size ? <Badge variant="outline">Size {item.size}</Badge> : null}
                  <Badge variant="outline">Qty {item.quantity}</Badge>
                </div>
                {variantMatch ? (
                  <p className="text-xs text-destructive">
                    {variantMatch.color} / {variantMatch.size} is no longer available.
                  </p>
                ) : null}
                {stockMatch ? (
                  <p className="text-xs text-destructive">
                    Only {stockMatch.available} available (you have {stockMatch.requested} in
                    your cart).
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatEGP(item.lineTotal)}
              </span>
            </li>
          );
        })}
      </ul>

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatEGP(cart.totalCartPrice)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-medium text-foreground">Estimated total</dt>
          <dd className="text-lg font-semibold text-foreground">
            {formatEGP(cart.totalPriceAfterDiscount)}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Shipping and any coupon discount are shown separately below and are not yet included in
        this total — the completed order confirms the final amount.
      </p>
    </div>
  );
}
