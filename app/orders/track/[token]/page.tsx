import type { Metadata } from "next";

import OrderTrackingFeature from "@/features/orders/components/order-tracking-feature";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type TrackOrderPageProps = {
  params: Promise<{ token: string }>;
};

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { token } = await params;
  return <OrderTrackingFeature token={token} />;
}
