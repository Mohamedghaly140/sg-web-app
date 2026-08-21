"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function OrderStatusFilter() {
  const [params, setParams] = useOrdersParams();

  return (
    <Select
      value={params.status ?? "all"}
      onValueChange={(value) => {
        if (value === null) return;
        setParams({
          status: value === "all" ? null : (value as OrderStatus),
          page: 1,
        });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All statuses</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
