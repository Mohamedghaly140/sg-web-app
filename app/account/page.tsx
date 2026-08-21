import type { Metadata } from "next";
import Link from "next/link";

import { LucideUserRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <EmptyState
      icon={<LucideUserRound className="size-6 text-muted-foreground" aria-hidden />}
      title="Nothing here yet"
      description="Manage your name, email, phone, and orders from the account menu."
      action={
        <div className="flex gap-2">
          <Button render={<Link href="/account/addresses" />} nativeButton={false}>
            Manage addresses
          </Button>
          <Button render={<Link href="/account/orders" />} nativeButton={false}>
            View orders
          </Button>
        </div>
      }
    />
  );
}
