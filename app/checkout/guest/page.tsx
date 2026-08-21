import type { Metadata } from "next";

import CheckoutGuestFeature from "@/features/checkout-guest";

export const metadata: Metadata = {
  title: "Guest checkout",
};

export default function CheckoutGuestPage() {
  return <CheckoutGuestFeature />;
}
