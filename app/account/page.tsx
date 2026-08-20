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
      description="Orders are coming soon. Manage your name, email, and phone from the account menu."
      action={
        <Button render={<Link href="/account/addresses" />} nativeButton={false}>
          Manage addresses
        </Button>
      }
    />
  );
}
