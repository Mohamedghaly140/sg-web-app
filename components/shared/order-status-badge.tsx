import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { OrderStatus } from "@/features/checkout/types/order";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "warning" },
  SHIPPED: { label: "Shipped", variant: "info" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "outline" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { label, variant } = ORDER_STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
