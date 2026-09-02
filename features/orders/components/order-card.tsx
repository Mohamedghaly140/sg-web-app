import Image from "next/image";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { OrderItem } from "@/features/checkout/types/order";
import { BuyAgainButton } from "@/features/orders/components/buy-again-button";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import type {
  OrderStatus,
  OrderSummary,
} from "@/features/orders/types/order";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import { cldUrl, formatDate, isSameDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderCardProps = {
  order: OrderSummary;
  hydratedItems?: OrderItem[];
};

const TERMINAL_STATUSES = new Set<OrderStatus>([
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

const FADED_STATUSES = new Set<OrderStatus>(["CANCELLED", "REFUNDED"]);

function getProductSummary(items: OrderItem[]): string | null {
  if (items.length === 0) {
    return null;
  }

  const visibleNames = items.slice(0, 2).map((item) => item.name);
  const remaining = items.length - visibleNames.length;

  return remaining > 0
    ? `${visibleNames.join(" · ")} · and ${remaining} more`
    : visibleNames.join(" · ");
}

export function OrderCard({ order, hydratedItems }: OrderCardProps) {
  // Only the newest in-progress order is hydrated (one extra GET /orders/:id,
  // see OrdersResults), so hydration is also what marks the single focal card
  // the design draws with an accent border. Keep the two coupled deliberately:
  // deriving this from `status` instead would light up every in-progress order
  // on the page.
  const isFocalCard = hydratedItems !== undefined;
  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const isFaded = FADED_STATUSES.has(order.status);
  const canCancel = order.status === "PENDING" && !order.isPaid;
  const hasShippingFees = !isSameDecimal(order.shippingFees, "0");
  const lineCount =
    order.itemsCount === 1 ? "1 line" : `${order.itemsCount} lines`;
  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.value === order.paymentMethod)
      ?.label ?? order.paymentMethod;
  const paymentSummary = `${paymentLabel}, ${order.isPaid ? "paid" : "unpaid"}`;
  const productSummary = hydratedItems
    ? getProductSummary(hydratedItems)
    : null;

  return (
    <li>
      <Card
        size="sm"
        data-selected={isFocalCard ? true : undefined}
        className={cn(isFaded && "opacity-75")}
      >
        <CardHeader className="flex flex-row items-baseline gap-2">
          <p className="font-heading text-xl font-normal tabular-nums">
            {order.humanOrderId}
          </p>
          <OrderStatusBadge status={order.status} />
          <p className="figures ml-auto text-xs text-muted-foreground">
            {formatDate(order.createdAt)} · {lineCount}
          </p>
        </CardHeader>

        <CardContent className="flex items-center gap-4">
          {hydratedItems && hydratedItems.length > 0 ? (
            <ul className="flex shrink-0 gap-2" aria-label="Order lines">
              {hydratedItems.slice(0, 3).map((item, index) => (
                <li
                  key={`${item.productId}-${index}`}
                  className="relative aspect-[3/4] w-[46px] shrink-0"
                >
                  <span className="plate plate-sm absolute inset-0 overflow-hidden">
                    <Image
                      src={cldUrl(item.imageUrl, {
                        width: 92,
                        height: 123,
                        crop: "fill",
                        gravity: "auto",
                        quality: "auto",
                        format: "auto",
                      })}
                      alt={item.name}
                      fill
                      sizes="46px"
                      className="object-cover"
                    />
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-1 text-xs">
            {productSummary ? <p>{productSummary}</p> : null}
            <p className="text-muted-foreground">
              {paymentSummary}
              {order.status === "CANCELLED" ? (
                <>
                  <span aria-hidden="true"> · </span>
                  Stock may have been returned, coupon may have been released
                </>
              ) : null}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="figures font-heading text-[18px] font-normal">
              <Money value={order.totalOrderPrice} />
            </p>
            {hasShippingFees ? (
              <p className="text-[11.5px] text-muted-foreground">
                incl. <Money value={order.shippingFees} /> shipping
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="gap-2 border-t-0 pt-0">
          <Button
            render={<Link href={`/account/orders/${order.id}`} />}
            nativeButton={false}
            variant={isFocalCard ? "default" : "outline"}
          >
            View order
          </Button>
          {canCancel ? (
            <CancelOrderButton orderId={order.id} variant="secondary" />
          ) : null}
          {isTerminal ? <BuyAgainButton orderId={order.id} /> : null}
          {isFocalCard ? (
            <Button
              render={<Link href="/contact" />}
              nativeButton={false}
              variant="ghost"
              className="ml-auto"
            >
              Need help with this order
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </li>
  );
}
