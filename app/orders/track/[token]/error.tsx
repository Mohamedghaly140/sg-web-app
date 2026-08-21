"use client";

import { LucideRefreshCw, LucideTriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type TrackOrderErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function TrackOrderError({ retry }: TrackOrderErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={
          <LucideTriangleAlert
            className="size-6 text-muted-foreground"
            aria-hidden
          />
        }
        title="Something went wrong"
        description="Something went wrong loading this order"
        action={
          <Button type="button" onClick={() => retry()}>
            <LucideRefreshCw />
            Try again
          </Button>
        }
      />
    </div>
  );
}
