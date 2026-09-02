import type { ReactNode } from "react";

import { RefreshOrdersButton } from "@/features/orders/components/refresh-orders-button";

type OrdersHeaderProps = {
  count: ReactNode;
  filter: ReactNode;
};

export function OrdersHeader({ count, filter }: OrdersHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-heading text-2xl font-normal text-foreground">
          Orders
        </h1>
        <div className="ml-auto flex items-center gap-1">
          {count}
          <RefreshOrdersButton />
        </div>
      </div>
      {filter}
    </header>
  );
}
