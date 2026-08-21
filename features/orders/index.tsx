import { Suspense } from "react";

import { OrderStatusFilter } from "@/features/orders/components/order-status-filter";
import { OrdersListSkeleton } from "@/features/orders/components/orders-list-skeleton";
import { OrdersResults } from "@/features/orders/components/orders-results";
import { OrdersRefreshProvider } from "@/features/orders/components/orders-refresh-context";
import { OrdersResultsBoundary } from "@/features/orders/components/orders-results-boundary";
import { OrdersResultsReporter } from "@/features/orders/components/orders-results-reporter";
import { RefreshOrdersButton } from "@/features/orders/components/refresh-orders-button";
import type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";

type OrdersFeatureProps = {
  searchParams: OrdersSearchParams;
};

export default function OrdersFeature({ searchParams }: OrdersFeatureProps) {
  return (
    <OrdersRefreshProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Orders
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusFilter />
            <RefreshOrdersButton />
          </div>
        </div>
        <OrdersResultsBoundary
          key={JSON.stringify(searchParams)}
          title="Orders"
        >
          <Suspense
            key={JSON.stringify(searchParams)}
            fallback={<OrdersListSkeleton />}
          >
            <OrdersResultsReporter>
              <OrdersResults searchParams={searchParams} />
            </OrdersResultsReporter>
          </Suspense>
        </OrdersResultsBoundary>
      </div>
    </OrdersRefreshProvider>
  );
}
