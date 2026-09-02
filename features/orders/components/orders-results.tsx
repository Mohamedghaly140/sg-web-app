import Link from "next/link";
import { LucidePackage, LucideSearchX } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { OrdersHeader } from "@/features/orders/components/orders-header";
import { OrdersList } from "@/features/orders/components/orders-list";
import {
  buildOrdersHref,
  OrdersPagination,
} from "@/features/orders/components/orders-pagination";
import {
  toGetOrdersParams,
  type OrdersSearchParams,
} from "@/features/orders/hooks/orders-search-params";
import { getOrderPreview } from "@/features/orders/queries/get-order";
import { getOrders } from "@/features/orders/queries/get-orders";
import { redirectToLastPageIfOutOfRange } from "@/lib/pagination";

type OrdersResultsProps = {
  searchParams: OrdersSearchParams;
  filter: ReactNode;
};

const IN_PROGRESS_STATUSES = new Set(["PENDING", "PROCESSING", "SHIPPED"]);

export async function OrdersResults({
  searchParams,
  filter,
}: OrdersResultsProps) {
  const { data: orders, meta } = await getOrders(
    toGetOrdersParams(searchParams),
  );

  redirectToLastPageIfOutOfRange(meta, (page) =>
    buildOrdersHref(searchParams, { page }),
  );

  const inProgressOrder = orders.find((order) =>
    IN_PROGRESS_STATUSES.has(order.status),
  );
  const hydratedOrder = inProgressOrder
    ? await getOrderPreview(inProgressOrder.id)
    : null;

  let content: ReactNode;

  if (orders.length === 0 && searchParams.status === null) {
    content = (
      <EmptyState
        icon={
          <LucidePackage className="size-6 text-muted-foreground" aria-hidden />
        }
        title="No orders yet"
        titleAs="h3"
        description="When you place an order, it will show up here."
        action={
          <Button render={<Link href="/products" />} nativeButton={false}>
            Start shopping
          </Button>
        }
      />
    );
  }

  if (orders.length === 0 && searchParams.status !== null) {
    content = (
      <EmptyState
        icon={
          <LucideSearchX className="size-6 text-muted-foreground" aria-hidden />
        }
        title="No orders with this status"
        titleAs="h3"
        description="Try a different status or view all your orders."
        action={
          <Button
            render={
              <Link
                href={buildOrdersHref(searchParams, { status: null, page: 1 })}
              />
            }
            nativeButton={false}
            variant="outline"
          >
            View all orders
          </Button>
        }
      />
    );
  } else if (orders.length > 0) {
    content = (
      <div className="flex flex-col gap-8">
        <OrdersList orders={orders} hydratedOrder={hydratedOrder} />
        <OrdersPagination searchParams={searchParams} meta={meta} />
      </div>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <OrdersHeader
        count={
          /* The empty states below carry their own copy, so a count line would
             only repeat it at zero — same call as the addresses screen. */
          meta.totalItems > 0 ? (
            <p className="figures text-xs text-muted-foreground">
              {meta.totalItems} {meta.totalItems === 1 ? "order" : "orders"} ·
              newest first
            </p>
          ) : null
        }
        filter={filter}
      />
      {content}
    </section>
  );
}
