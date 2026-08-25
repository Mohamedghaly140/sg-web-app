"use client";

import { catchError, type ErrorInfo } from "next/error";

import { Button } from "@/components/ui/button";

type SectionErrorFallbackProps = {
  title: string;
};

function SectionErrorFallback(
  { title }: SectionErrorFallbackProps,
  { retry }: ErrorInfo,
) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-border px-4 py-16 text-center">
      <p className="text-sm font-medium">
        {title} is unavailable right now.
      </p>
      <Button variant="outline" size="sm" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}

export const SectionErrorBoundary = catchError(SectionErrorFallback);
