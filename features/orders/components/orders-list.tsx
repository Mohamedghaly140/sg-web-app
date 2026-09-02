import type { OrderDetail } from "@/features/checkout/types/order";
import { OrderCard } from "@/features/orders/components/order-card";
import type { OrderSummary } from "@/features/orders/types/order";

export type OrdersListProps = {
  orders: OrderSummary[];
  hydratedOrder: OrderDetail | null;
};

export function OrdersList({ orders, hydratedOrder }: OrdersListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          {...(order.id === hydratedOrder?.id
            ? { hydratedItems: hydratedOrder.items }
            : {})}
        />
      ))}
    </ul>
  );
}
