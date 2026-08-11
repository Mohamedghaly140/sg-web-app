import type { Metadata } from "next";

import CartFeature from "@/features/cart";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
  return <CartFeature />;
}
