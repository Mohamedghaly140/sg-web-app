"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useContext, useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { OrdersRefreshContext } from "@/features/orders/components/orders-refresh-context";

type OrdersResultsFallbackProps = {
  title: string;
};

function OrdersResultsFallback(
  { title }: OrdersResultsFallbackProps,
  { error, retry }: ErrorInfo,
) {
  const refreshState = useContext(OrdersRefreshContext);

  useEffect(() => {
    refreshState?.reportError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  if (refreshState && refreshState.lastGood !== null) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <span>
            Couldn&apos;t refresh {title.toLowerCase()} — showing the last
            loaded results.
          </span>
          <Button variant="outline" size="sm" onClick={() => retry()}>
            Try again
          </Button>
        </div>
        {refreshState.lastGood}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border py-10 text-center">
      <p className="text-sm text-muted-foreground">
        {title} is unavailable right now.
      </p>
      <Button variant="outline" size="sm" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}

const OrdersResultsCatchBoundary = catchError(OrdersResultsFallback);

type OrdersResultsBoundaryProps = {
  title: string;
  children: ReactNode;
};

export function OrdersResultsBoundary({
  title,
  children,
}: OrdersResultsBoundaryProps) {
  return (
    <OrdersResultsCatchBoundary title={title}>
      {children}
    </OrdersResultsCatchBoundary>
  );
}
