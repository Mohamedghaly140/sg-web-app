"use client";

import { useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideRefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrdersRefreshContext } from "@/features/orders/components/orders-refresh-context";

export function RefreshOrdersButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const refreshState = useContext(OrdersRefreshContext);

  if (refreshState?.hasError) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <LucideRefreshCw className={isPending ? "animate-spin" : undefined} />
      Refresh
    </Button>
  );
}
