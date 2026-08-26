import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import type { OrderItemParsed } from "@/features/checkout/schema/order-item-schema";
import type { OrderStatus } from "@/features/checkout/types/order";
import { formatDate, isSameDecimal } from "@/lib/format";

export type OrderConfirmationProps = {
  customerName: string;
  humanOrderId: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: string;
  totalOrderPrice: string;
  items: OrderItemParsed[];
  itemsSubtotal: string;
  discountApplied: string;
  couponCode?: string;
  shippingFees: string;
  deliveryDestination: string;
  isGuest: boolean;
  orderId?: string;
  claimToken?: "sent-by-email";
  email?: string;
};

export function OrderConfirmation({
  customerName,
  humanOrderId,
  createdAt,
  status,
  paymentMethod,
  totalOrderPrice,
  items,
  itemsSubtotal,
  discountApplied,
  couponCode,
  shippingFees,
  deliveryDestination,
  isGuest,
  orderId,
  claimToken,
  email,
}: OrderConfirmationProps) {
  const hasDiscount = !isSameDecimal(discountApplied, "0");

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 py-12">
      <p className="text-eyebrow">Order placed · {formatDate(createdAt)}</p>
      <h2 className="font-heading text-[36px] font-normal">
        Thank you, {customerName}.
      </h2>
      <p className="max-w-[56ch] text-justify text-sm text-muted-foreground">
        Your order <span className="figures text-foreground">{humanOrderId}</span>{" "}
        is confirmed and being prepared.
      </p>

      <div className="border-t border-border" />

      <div className="grid grid-cols-3 gap-6 text-xs">
        <div>
          <p className="text-eyebrow mb-1">Status</p>
          <OrderStatusBadge status={status} />
        </div>
        <div>
          <p className="text-eyebrow mb-1">Payment</p>
          <p>
            {paymentMethod === "CASH" ? "Cash on delivery" : paymentMethod} ·{" "}
            <Money value={totalOrderPrice} />
          </p>
        </div>
        <div>
          <p className="text-eyebrow mb-1">Delivery</p>
          <p>
            {deliveryDestination} · <Money value={shippingFees} />
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      <table className="w-full text-sm">
        <caption className="sr-only">Order items</caption>
        <thead className="text-eyebrow">
          <tr className="border-b border-border">
            <th className="py-3 text-left font-normal" scope="col">
              Piece
            </th>
            <th className="py-3 text-left font-normal" scope="col">
              Variant
            </th>
            <th className="py-3 text-right font-normal" scope="col">
              Qty
            </th>
            <th className="py-3 text-right font-normal" scope="col">
              Line total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.productId}
              className="border-b border-border last:border-0"
            >
              <td className="py-3 pr-4">{item.name}</td>
              <td className="py-3 pr-4 text-muted-foreground">
                {[item.color, item.size].filter(Boolean).join(" · ") || "—"}
              </td>
              <td className="figures py-3 text-right">{item.quantity}</td>
              <td className="figures py-3 text-right">
                <Money value={item.lineTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-border" />

      <div className="flex justify-end">
        <dl className="figures flex w-[300px] flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Items subtotal</dt>
            <dd>
              <Money value={itemsSubtotal} />
            </dd>
          </div>
          {hasDiscount ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                Discount{couponCode ? ` · ${couponCode}` : ""}
              </dt>
              <dd>
                −<Money value={discountApplied} />
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>
              <Money value={shippingFees} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
            <dt className="font-medium text-foreground">Total</dt>
            <dd className="text-lg font-semibold text-foreground">
              <Money value={totalOrderPrice} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-border" />

      {isGuest && claimToken === "sent-by-email" ? (
        <div className="flex items-center gap-4 border border-border p-4">
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Keep this order in an account
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an account{email ? ` with ${email}` : ""}, then use the
              tracking link in your email to claim this order into it.
            </p>
          </div>
          <SignUpButton
            mode="modal"
            fallbackRedirectUrl="/orders/track"
            initialValues={email ? { emailAddress: email } : undefined}
          >
            <Button type="button">Create account</Button>
          </SignUpButton>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        {isGuest ? (
          <Button
            variant="outline"
            render={<Link href="/orders/track" />}
            nativeButton={false}
          >
            Track this order
          </Button>
        ) : orderId ? (
          <Button
            variant="outline"
            render={<Link href={`/account/orders/${orderId}`} />}
            nativeButton={false}
          >
            Track this order
          </Button>
        ) : null}
        <Button
          variant="ghost"
          render={<Link href="/products" />}
          nativeButton={false}
        >
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
