import { Package as LucidePackage } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { OrderStatusStepper } from "@/features/orders/components/order-status-stepper";
import type { OrderSummary } from "@/features/orders/types/order";
import { formatDate, formatEGP } from "@/lib/format";

type OrderListItemProps = {
  order: OrderSummary;
};

const SHOW_ROW_STEPPER = new Set([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);

export function OrderListItem({ order }: OrderListItemProps) {
  const showStepper = SHOW_ROW_STEPPER.has(order.status);

  return (
    <li>
      <Link
        href={`/account/orders/${order.id}`}
        className="flex gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-none bg-muted sm:size-14"
            aria-hidden
          >
            <LucidePackage className="size-4 text-muted-foreground" />
          </span>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="font-heading text-sm font-medium text-foreground">
                {order.humanOrderId}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {formatDate(order.createdAt)}
                {" · "}
                {order.itemsCount === 1
                  ? "1 item"
                  : `${order.itemsCount} items`}
              </p>
            </div>
            {showStepper ? (
              <OrderStatusStepper status={order.status} variant="row" />
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
          <OrderStatusBadge status={order.status} />
          <p className="text-sm font-medium text-foreground">
            {formatEGP(order.totalOrderPrice)}
          </p>
        </div>
      </Link>
    </li>
  );
}
