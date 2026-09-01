import type { Metadata } from "next";

import AccountFeature from "@/features/account";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return <AccountFeature />;
}
