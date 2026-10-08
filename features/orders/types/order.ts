import type { OrderStatus } from "@/features/checkout/types/order";
import type { PaymentMethod } from "@/lib/constants/payment-methods";

export type { OrderStatus };

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export const IN_PROGRESS_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
]);

export type OrderSummary = {
  id: string;
  humanOrderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  totalOrderPrice: string;
  shippingFees: string;
  discountApplied: string;
  createdAt: string;
  /** Distinct order lines/products — not summed quantity. */
  itemsCount: number;
};
