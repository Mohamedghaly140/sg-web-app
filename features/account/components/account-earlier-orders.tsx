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

/* Visible column labels for the stacked presentation below `md`. They are
   aria-hidden because the sr-only <thead> already names every column — without
   that, a screen reader on a phone reads "Order Order SG-2026-000123". */
const stackedLabelClassName =
  "text-[11px] tracking-[0.08em] text-muted-foreground uppercase md:hidden";

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
        <div className="md:overflow-x-auto">
          {/* Below `md` the rows restyle to stacked blocks via `display`. Browsers
              compute table semantics from the *computed* display value, so
              `block`/`flex` here would drop the implicit table roles and break the
              sr-only <thead> associations exactly where they are needed most.
              The explicit roles below survive the display override and are a
              no-op at `md`+, where they match what the elements already imply. */}
          <table role="table" className="w-full text-sm max-md:block">
            <caption className="sr-only">Earlier orders</caption>
            <thead role="rowgroup" className="sr-only">
              <tr role="row">
                <th scope="col">Order</th>
                <th scope="col">Placed</th>
                <th scope="col">Status</th>
                <th scope="col">Total</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="max-md:block">
              {orders.map((order) => {
                const lineCount = `${order.itemsCount} ${
                  order.itemsCount === 1 ? "line" : "lines"
                }`;

                return (
                  <tr
                    key={order.id}
                    role="row"
                    className="border-b border-border last:border-b-0 max-md:flex max-md:flex-col max-md:gap-2 max-md:py-3"
                  >
                    <th
                      role="rowheader"
                      scope="row"
                      className="py-3 pr-4 text-left font-normal tabular-nums max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 max-md:pr-0 md:table-cell"
                    >
                      <span aria-hidden="true" className={stackedLabelClassName}>Order</span>
                      <span className="figures">{order.humanOrderId}</span>
                    </th>
                    <td role="cell" className="px-4 py-3 text-muted-foreground max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:px-0 max-md:py-0 md:table-cell">
                      <span aria-hidden="true" className={stackedLabelClassName}>Placed</span>
                      <span className="figures text-right md:text-left">
                        {formatDayMonth(order.createdAt)}
                        <span aria-hidden="true"> · </span>
                        {lineCount}
                      </span>
                    </td>
                    <td role="cell" className="px-4 py-3 max-md:flex max-md:items-center max-md:justify-between max-md:gap-3 max-md:px-0 max-md:py-0 md:table-cell">
                      <span aria-hidden="true" className={stackedLabelClassName}>Status</span>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td role="cell" className="px-4 py-3 text-right tabular-nums max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:px-0 max-md:py-0 md:table-cell">
                      <span aria-hidden="true" className={stackedLabelClassName}>Total</span>
                      <span className="figures">
                        <Money value={order.totalOrderPrice} />
                      </span>
                    </td>
                    <td role="cell" className="py-3 pl-4 text-right max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 max-md:pl-0 md:table-cell">
                      <span aria-hidden="true" className={stackedLabelClassName}>Details</span>
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
