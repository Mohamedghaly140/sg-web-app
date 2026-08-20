import type { Metadata } from "next";

import { LucideUserRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <EmptyState
      icon={<LucideUserRound className="size-6 text-muted-foreground" aria-hidden />}
      title="Nothing here yet"
      description="Addresses and orders are coming soon. Manage your name, email, and phone from the account menu."
    />
  );
}
