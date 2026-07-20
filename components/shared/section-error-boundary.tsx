"use client";

import { unstable_catchError as catchError, type ErrorInfo } from "next/error";

import { Button } from "@/components/ui/button";

type SectionErrorFallbackProps = {
  title: string;
};

function SectionErrorFallback(
  { title }: SectionErrorFallbackProps,
  { unstable_retry }: ErrorInfo,
) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border py-10 text-center">
      <p className="text-sm text-muted-foreground">
        {title} is unavailable right now.
      </p>
      <Button variant="outline" size="sm" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </div>
  );
}

export const SectionErrorBoundary = catchError(SectionErrorFallback);
