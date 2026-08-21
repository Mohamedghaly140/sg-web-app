"use client";

import { useContext, useEffect, type ReactNode } from "react";

import { OrdersRefreshContext } from "@/features/orders/components/orders-refresh-context";

type OrdersResultsReporterProps = {
  children: ReactNode;
};

export function OrdersResultsReporter({
  children,
}: OrdersResultsReporterProps) {
  const refreshState = useContext(OrdersRefreshContext);

  useEffect(() => {
    refreshState?.reportSuccess(children);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return <>{children}</>;
}
