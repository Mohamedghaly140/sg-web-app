import type { Metadata } from "next";

import OrderDetailFeature from "@/features/orders/components/order-detail-feature";

export const metadata: Metadata = {
  title: "Order details",
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailFeature id={id} />;
}
