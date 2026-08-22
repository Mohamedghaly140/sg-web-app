import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderDetail } from "@/features/checkout/types/order";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import { OrderItemRow } from "@/features/orders/components/order-item-row";
import { OrderStatusStepper } from "@/features/orders/components/order-status-stepper";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import { formatDate, formatEGP, isSameDecimal } from "@/lib/format";

type OrderDetailViewProps = {
  order: OrderDetail;
  back?: { href: string; label: string };
  /** Owner account detail only — never set on guest tracking. */
  allowCancel?: boolean;
};

const TERMINAL_STATUSES = new Set(["CANCELLED", "REFUNDED"]);

export function OrderDetailView({
  order,
  back,
  allowCancel = false,
}: OrderDetailViewProps) {
  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.value === order.paymentMethod)
      ?.label ?? order.paymentMethod;
  const hasDiscount = !isSameDecimal(order.discountApplied, "0");
  const canCancel =
    allowCancel && order.status === "PENDING" && !order.isPaid;
  const isTerminal = TERMINAL_STATUSES.has(order.status);

  return (
    <>
      {back ? (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <LucideArrowLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      ) : null}

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {order.humanOrderId}
          </h1>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge isPaid={order.isPaid} />
          {canCancel ? <CancelOrderButton orderId={order.id} /> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.createdAt)}
          {" · "}
          {paymentLabel}
        </p>
      </header>

      {isTerminal ? (
        <div className="flex items-center gap-2 border border-border bg-muted/40 px-3 py-2">
          <Badge variant={order.status === "CANCELLED" ? "destructive" : "outline"}>
            {order.status === "CANCELLED" ? "Order cancelled" : "Order refunded"}
          </Badge>
          <p className="text-sm text-muted-foreground">
            This order is no longer in progress.
          </p>
        </div>
      ) : (
        <OrderStatusStepper status={order.status} variant="detail" />
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="flex flex-col">
              {order.items.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  {index > 0 ? <Separator /> : null}
                  <OrderItemRow item={item} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="w-full shrink-0 lg:sticky lg:top-6 lg:w-84">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Items subtotal</dt>
                <dd>{formatEGP(order.itemsSubtotal)}</dd>
              </div>
              {hasDiscount ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>-{formatEGP(order.discountApplied)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatEGP(order.shippingFees)}</dd>
              </div>
              <Separator />
              <div className="flex items-end justify-between gap-4">
                <dt className="font-medium text-foreground">Total</dt>
                <dd className="text-xl font-semibold tracking-tight text-foreground">
                  {formatEGP(order.totalOrderPrice)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
