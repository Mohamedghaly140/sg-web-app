"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideRefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TrackingRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <LucideRefreshCw className={isPending ? "animate-spin" : undefined} />
      Try again
    </Button>
  );
}
