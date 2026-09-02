import type { Metadata } from "next";
import { LucideSearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { TRACKING_INVALID_MESSAGE } from "@/features/orders/lib/order-tracking-copy";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function TrackOrderNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={
          <LucideSearchX className="size-6 text-muted-foreground" aria-hidden />
        }
        title="Order not found"
        description={TRACKING_INVALID_MESSAGE}
        action={
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="default"
          >
            Continue shopping
          </Button>
        }
      />
    </div>
  );
}
