import type { Metadata } from "next";

import { OrderTrackLookup } from "@/features/orders/components/order-track-lookup";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function OrderTrackLookupPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-display-2 text-foreground">
        Track your order
      </h1>
      <OrderTrackLookup />
    </div>
  );
}
