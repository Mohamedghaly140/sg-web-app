import { Suspense } from "react";

import { OrderStatusFilter } from "@/features/orders/components/order-status-filter";
import { OrdersListSkeleton } from "@/features/orders/components/orders-list-skeleton";
import { OrdersResults } from "@/features/orders/components/orders-results";
import { OrdersRefreshProvider } from "@/features/orders/components/orders-refresh-context";
import { OrdersResultsBoundary } from "@/features/orders/components/orders-results-boundary";
import { OrdersResultsReporter } from "@/features/orders/components/orders-results-reporter";
import type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";

type OrdersFeatureProps = {
  searchParams: OrdersSearchParams;
};

export default function OrdersFeature({ searchParams }: OrdersFeatureProps) {
  const filter = <OrderStatusFilter searchParams={searchParams} />;

  return (
    <OrdersRefreshProvider>
      <OrdersResultsBoundary key={JSON.stringify(searchParams)} title="Orders">
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<OrdersListSkeleton filter={filter} />}
        >
          <OrdersResultsReporter>
            <OrdersResults searchParams={searchParams} filter={filter} />
          </OrdersResultsReporter>
        </Suspense>
      </OrdersResultsBoundary>
    </OrdersRefreshProvider>
  );
}
