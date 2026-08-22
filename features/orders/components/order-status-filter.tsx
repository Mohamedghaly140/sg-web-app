"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useOrdersParams } from "@/features/orders/hooks/use-orders-params";
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

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
] as const;

export function OrderStatusFilter() {
  const [params, setParams] = useOrdersParams();
  const selected = params.status ?? "all";

  return (
    <ToggleGroup
      className="flex max-w-full flex-wrap"
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Filter by order status"
      value={[selected]}
      onValueChange={(next) => {
        const value = next[next.length - 1];
        if (!value) return;
        setParams({
          status: value === "all" ? null : (value as OrderStatus),
          page: 1,
        });
      }}
    >
      {FILTER_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          type="button"
          className="shrink-0 px-2.5"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
