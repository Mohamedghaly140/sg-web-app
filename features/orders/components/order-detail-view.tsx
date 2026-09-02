import type { ReactNode } from "react";

import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Separator } from "@/components/ui/separator";
import type { OrderDetail } from "@/features/checkout/types/order";
import { OrderHelpCard } from "@/features/orders/components/order-help-card";
import { OrderItemRow } from "@/features/orders/components/order-item-row";
import { OrderPaymentCard } from "@/features/orders/components/order-payment-card";
import { OrderStatusStepper } from "@/features/orders/components/order-status-stepper";
import { formatDateTime } from "@/lib/format";

type OrderDetailViewProps = {
  order: OrderDetail;
  /** Owner account detail only — never set on guest tracking. */
  allowCancel?: boolean;
  /** Extra rail content, e.g. guest tracking's claim card. */
  rail?: ReactNode;
};

const TERMINAL_STATUSES = new Set<OrderDetail["status"]>([
  "CANCELLED",
  "REFUNDED",
]);

export function OrderDetailView({
  order,
  allowCancel = false,
  rail,
}: OrderDetailViewProps) {
  const canCancel = Boolean(
    allowCancel && order.status === "PENDING" && !order.isPaid,
  );
  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const lineCount = `${order.items.length} ${
    order.items.length === 1 ? "line" : "lines"
  }`;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-w-0 flex-col gap-4">
        <header className="flex items-baseline gap-3">
          {/* Screen S13 draws this at h3 size, but it is the page's only
              top-level heading on both the account and guest tracking routes —
              neither parent renders one above it — so the level is h1 and the
              Classical 25px treatment comes from the utilities. */}
          <h1 className="figures font-heading text-2xl font-normal">
            {order.humanOrderId}
          </h1>
          <OrderStatusBadge status={order.status} />
          <span className="figures ml-auto text-xs text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </span>
        </header>
        <Separator />

        {isTerminal ? (
          // The header already carries the status tag, so the terminal notice
          // is the explanatory line alone — repeating the badge here would
          // print the same word twice, two rows apart.
          <p className="text-xs text-muted-foreground">
            This order is no longer in progress.
          </p>
        ) : (
          <OrderStatusStepper
            status={order.status}
            variant="detail"
            placedAt={order.createdAt}
          />
        )}
        <Separator />

        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-xl font-normal">{lineCount}</h2>
          <span className="text-[11.5px] text-muted-foreground">
            Prices as they were when you ordered
          </span>
        </div>
        <ul>
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`}>
              <OrderItemRow item={item} />
            </li>
          ))}
        </ul>
      </section>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
        <OrderPaymentCard order={order} />
        <OrderHelpCard
          orderId={order.id}
          isOwner={allowCancel}
          canCancel={canCancel}
        />
        {rail}
      </aside>
    </div>
  );
}
