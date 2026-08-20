import type { Metadata } from "next";

import AddressesFeature from "@/features/addresses";

export const metadata: Metadata = {
  title: "Addresses",
};

export default function AddressesPage() {
  return <AddressesFeature />;
}
