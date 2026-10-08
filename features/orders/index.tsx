import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { OrderStatusFilter } from "@/features/orders/components/order-status-filter";
import { OrdersListSkeleton } from "@/features/orders/components/orders-list-skeleton";
import { OrdersResults } from "@/features/orders/components/orders-results";
import type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";

type OrdersFeatureProps = {
  searchParams: OrdersSearchParams;
};

export default function OrdersFeature({ searchParams }: OrdersFeatureProps) {
  const filter = <OrderStatusFilter searchParams={searchParams} />;

  return (
    <SectionErrorBoundary key={JSON.stringify(searchParams)} title="Orders">
      <Suspense
        key={JSON.stringify(searchParams)}
        fallback={<OrdersListSkeleton filter={filter} />}
      >
        <OrdersResults searchParams={searchParams} filter={filter} />
      </Suspense>
    </SectionErrorBoundary>
  );
}
