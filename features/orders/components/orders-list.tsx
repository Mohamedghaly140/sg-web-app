import { OrderListItem } from "@/features/orders/components/order-list-item";
import type { OrderSummary } from "@/features/orders/types/order";

export type OrdersListProps = {
  orders: OrderSummary[];
};

export function OrdersList({ orders }: OrdersListProps) {
  return (
    <ul className="divide-y divide-border border border-border bg-card shadow-sm">
      {orders.map((order) => (
        <OrderListItem key={order.id} order={order} />
      ))}
    </ul>
  );
}
