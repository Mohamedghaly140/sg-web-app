import type { Metadata } from "next";

import WishlistFeature from "@/features/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return <WishlistFeature />;
}
