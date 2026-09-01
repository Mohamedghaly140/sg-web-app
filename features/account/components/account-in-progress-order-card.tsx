import Image from "next/image";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { OrderItem } from "@/features/checkout/types/order";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import { OrderStatusStepper } from "@/features/orders/components/order-status-stepper";
import type { OrderSummary } from "@/features/orders/types/order";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import { cldUrl, formatDayMonth } from "@/lib/format";

type AccountInProgressOrderCardProps = {
  order: OrderSummary;
  items: OrderItem[];
};

export function AccountInProgressOrderCard({
  order,
  items,
}: AccountInProgressOrderCardProps) {
  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.value === order.paymentMethod)
      ?.label ?? order.paymentMethod;
  const lineCount = `${order.itemsCount} ${
    order.itemsCount === 1 ? "line" : "lines"
  }`;
  const canCancel = order.status === "PENDING" && !order.isPaid;

  return (
    <Card data-selected>
      <CardHeader>
        <p className="text-kicker">In progress</p>
        <CardAction>
          <OrderStatusBadge status={order.status} />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {items.length > 0 ? (
          <ul className="flex shrink-0 gap-2" aria-label="Order lines">
            {items.slice(0, 2).map((item, index) => (
              <li
                key={`${item.productId}-${index}`}
                className="relative aspect-[3/4] w-[52px] shrink-0"
              >
                <span className="plate absolute inset-0 overflow-hidden">
                  <Image
                    src={cldUrl(item.imageUrl, {
                      width: 104,
                      height: 139,
                      crop: "fill",
                      gravity: "auto",
                      quality: "auto",
                      format: "auto",
                    })}
                    alt={item.name}
                    fill
                    sizes="52px"
                    className="object-cover"
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-heading text-[19px] leading-tight font-normal tabular-nums">
            {order.humanOrderId}
          </p>
          <p className="text-xs text-muted-foreground">
            Placed {formatDayMonth(order.createdAt)}
            <span aria-hidden="true"> · </span>
            {lineCount}
            <span aria-hidden="true"> · </span>
            {paymentLabel}
            <span aria-hidden="true"> · </span>
            <Money value={order.totalOrderPrice} />
          </p>
          <OrderStatusStepper status={order.status} variant="track" />
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
          render={<Link href={`/account/orders/${order.id}`} />}
          nativeButton={false}
        >
          View order
        </Button>
        {canCancel ? <CancelOrderButton orderId={order.id} /> : null}
      </CardFooter>
    </Card>
  );
}
