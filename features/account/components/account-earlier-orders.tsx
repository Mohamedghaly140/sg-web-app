import Link from "next/link";

import { Money } from "@/components/shared/money";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import type { OrderSummary } from "@/features/orders/types/order";
import { formatDayMonth } from "@/lib/format";

type AccountEarlierOrdersProps = {
  orders: OrderSummary[];
};

const detailsLinkClassName =
  "text-xs text-accent-strong underline-offset-3 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function AccountEarlierOrders({
  orders,
}: AccountEarlierOrdersProps) {
  return (
    <section aria-labelledby="earlier-orders-heading">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
        <h4
          id="earlier-orders-heading"
          className="font-heading text-xl font-normal text-foreground"
        >
          Earlier orders
        </h4>
        <Link href="/account/orders" className={detailsLinkClassName}>
          All orders
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">Earlier orders</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Placed</th>
                <th scope="col">Status</th>
                <th scope="col">Total</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const lineCount = `${order.itemsCount} ${
                  order.itemsCount === 1 ? "line" : "lines"
                }`;

                return (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="py-3 pr-4 text-left font-normal tabular-nums"
                    >
                      {order.humanOrderId}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDayMonth(order.createdAt)}
                      <span aria-hidden="true"> · </span>
                      {lineCount}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <Money value={order.totalOrderPrice} />
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className={detailsLinkClassName}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">No orders yet</p>
      )}
    </section>
  );
}
