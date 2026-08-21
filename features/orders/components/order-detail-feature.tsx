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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetailView
        order={order}
        back={{ href: "/account/orders", label: "Back to orders" }}
        allowCancel
      />
    </div>
  );
}
