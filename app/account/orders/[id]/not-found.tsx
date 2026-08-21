import { LucideSearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={
          <LucideSearchX className="size-6 text-muted-foreground" aria-hidden />
        }
        title="Order not found"
        description="This order may have been removed or does not belong to your account."
        action={
          <Button render={<Link href="/account/orders" />} nativeButton={false}>
            View all orders
          </Button>
        }
      />
    </div>
  );
}
