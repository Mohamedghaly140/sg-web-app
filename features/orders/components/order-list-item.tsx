import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import type { OrderSummary } from "@/features/orders/types/order";
import { formatDate, formatEGP } from "@/lib/format";

type OrderListItemProps = {
  order: OrderSummary;
};

export function OrderListItem({ order }: OrderListItemProps) {
  // Later phase: wrap this row in <Link href={`/account/orders/${order.id}`}>.
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1 text-sm">
        <p className="font-medium text-foreground">{order.humanOrderId}</p>
        <p className="text-muted-foreground">
          {formatDate(order.createdAt)}
          {" · "}
          {order.itemsCount === 1
            ? "1 item"
            : `${order.itemsCount} items`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <p className="text-sm font-medium text-foreground">
          {formatEGP(order.totalOrderPrice)}
        </p>
      </div>
    </li>
  );
}
