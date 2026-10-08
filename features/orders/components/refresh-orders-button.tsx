"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideRefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RefreshOrdersButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <LucideRefreshCw className={isPending ? "animate-spin" : undefined} />
      Refresh
    </Button>
  );
}
