import Image from "next/image";

import { Money } from "@/components/shared/money";
import type { OrderItem } from "@/features/checkout/types/order";
import { OrderLineBuyAgainButton } from "@/features/orders/components/order-line-buy-again-button";
import { cldUrl } from "@/lib/format";

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  const variantSegments = [
    ...(item.color ? [item.color] : []),
    ...(item.size ? [item.size] : []),
  ];

  return (
    <article className="flex gap-4 border-b border-border py-4">
      <div className="relative aspect-[3/4] w-[88px] shrink-0">
        <span className="plate absolute inset-0 overflow-hidden">
          <Image
            src={cldUrl(item.imageUrl, {
              width: 152,
              height: 203,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              format: "auto",
            })}
            alt={item.name}
            fill
            sizes="88px"
            className="object-cover"
          />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-heading text-[19px] font-normal">{item.name}</p>
          <span className="figures shrink-0 text-right text-[14.5px]">
            <Money value={item.lineTotal} />
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {variantSegments.length > 0 ? `${variantSegments.join(" · ")} · ` : null}
          {item.quantity} × <Money value={item.price} />
        </p>
        <OrderLineBuyAgainButton item={item} />
      </div>
    </article>
  );
}
