import { Suspense } from "react";

import { HideOnError } from "@/components/shared/hide-on-error";
import { DeliveryRow } from "@/features/products/components/delivery-row";

export function ProductMetaRows() {
  return (
    <dl className="flex flex-col gap-2 text-xs">
      <div className="flex justify-between gap-3">
        <dt className="text-muted-foreground">Delivery</dt>
        <dd>
          <HideOnError>
            <Suspense fallback={null}>
              <DeliveryRow />
            </Suspense>
          </HideOnError>
        </dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-muted-foreground">Payment</dt>
        <dd className="text-foreground">Cash on delivery</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-muted-foreground">Returns</dt>
        <dd className="text-foreground">14 days, unworn</dd>
      </div>
    </dl>
  );
}
