"use client";

import { LucideRefreshCw, LucideTriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type ProductsErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ProductsError({ unstable_retry }: ProductsErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideTriangleAlert className="size-6 text-muted-foreground" aria-hidden />}
        title="Something went wrong"
        description="We couldn't load these products. This is usually temporary — try again."
        action={
          <Button onClick={() => unstable_retry()}>
            <LucideRefreshCw />
            Try again
          </Button>
        }
      />
    </div>
  );
}
