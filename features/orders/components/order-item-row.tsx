import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { OrderItem } from "@/features/checkout/types/order";
import { cldUrl, formatEGP } from "@/lib/format";

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <article className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:py-5">
      <div className="relative size-24 overflow-hidden bg-muted sm:size-32">
        <Image
          src={cldUrl(item.imageUrl, {
            width: 256,
            height: 256,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
            format: "auto",
          })}
          alt={item.name}
          fill
          sizes="(min-width: 640px) 128px, 96px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <p className="font-heading text-base font-medium text-foreground">
          {item.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {item.color ? <Badge variant="outline">{item.color}</Badge> : null}
          {item.size ? (
            <Badge variant="outline">Size {item.size}</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
      </div>

      <dl className="col-span-2 flex flex-col gap-1 text-sm sm:col-span-1 sm:min-w-44 sm:items-end">
        <div className="flex items-baseline justify-between gap-4 sm:justify-end">
          <dt className="text-xs text-muted-foreground">Unit price</dt>
          <dd>{formatEGP(item.price)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 sm:justify-end">
          <dt className="text-xs text-muted-foreground">Line total</dt>
          <dd className="font-semibold text-foreground">
            {formatEGP(item.lineTotal)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
