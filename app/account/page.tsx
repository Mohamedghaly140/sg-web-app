import type { Metadata } from "next";

import ProfileFeature from "@/features/profile";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return <ProfileFeature />;
}
