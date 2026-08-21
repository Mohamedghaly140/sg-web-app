import type { Metadata } from "next";

import CheckoutFeature from "@/features/checkout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return <CheckoutFeature />;
}
