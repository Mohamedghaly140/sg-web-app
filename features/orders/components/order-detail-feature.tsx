import { Breadcrumb } from "@/components/shared/breadcrumb";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { getOrder } from "@/features/orders/queries/get-order";

type OrderDetailFeatureProps = {
  id: string;
};

export default async function OrderDetailFeature({
  id,
}: OrderDetailFeatureProps) {
  const order = await getOrder(id);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: order.humanOrderId },
        ]}
      />
      <OrderDetailView order={order} allowCancel />
    </div>
  );
}
