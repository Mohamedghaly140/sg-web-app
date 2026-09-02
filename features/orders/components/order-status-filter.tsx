import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buildOrdersHref } from "@/features/orders/components/orders-pagination";
import type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/features/orders/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const FILTER_OPTIONS: ReadonlyArray<{
  value: OrderStatus | null;
  label: string;
}> = [
  { value: null, label: "All" },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

type OrderStatusFilterProps = {
  searchParams: OrdersSearchParams;
};

export function OrderStatusFilter({ searchParams }: OrderStatusFilterProps) {
  return (
    <nav aria-label="Filter orders by status">
      <ul className="flex max-w-full flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = searchParams.status === option.value;

          return (
            <li key={option.value ?? "all"}>
              <Badge
                variant={isActive ? "outline" : "secondary"}
                render={
                  <Link
                    href={buildOrdersHref(searchParams, {
                      status: option.value,
                      page: 1,
                    })}
                    aria-current={isActive ? "page" : undefined}
                  />
                }
              >
                {option.label}
              </Badge>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
