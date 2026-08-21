import Link from "next/link";
import { LucidePackage, LucideSearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { OrdersList } from "@/features/orders/components/orders-list";
import {
  buildOrdersHref,
  OrdersPagination,
} from "@/features/orders/components/orders-pagination";
import {
  toGetOrdersParams,
  type OrdersSearchParams,
} from "@/features/orders/hooks/orders-search-params";
import { getOrders } from "@/features/orders/queries/get-orders";
import { redirectToLastPageIfOutOfRange } from "@/lib/pagination";

type OrdersResultsProps = {
  searchParams: OrdersSearchParams;
};

export async function OrdersResults({ searchParams }: OrdersResultsProps) {
  const { data: orders, meta } = await getOrders(
    toGetOrdersParams(searchParams),
  );

  redirectToLastPageIfOutOfRange(meta, (page) =>
    buildOrdersHref(searchParams, { page }),
  );

  if (orders.length === 0 && searchParams.status === null) {
    return (
      <EmptyState
        icon={
          <LucidePackage className="size-6 text-muted-foreground" aria-hidden />
        }
        title="No orders yet"
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
    return (
      <EmptyState
        icon={
          <LucideSearchX className="size-6 text-muted-foreground" aria-hidden />
        }
        title="No orders with this status"
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
  }

  return (
    <div className="flex flex-col gap-8">
      <OrdersList orders={orders} />
      <OrdersPagination searchParams={searchParams} meta={meta} />
    </div>
  );
}
