import Image from "next/image";
import Link from "next/link";
import { LucideLoaderCircle, LucideTrash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import type { CartItem } from "@/features/cart/types/cart";
import { cldUrl } from "@/lib/format";

type CartDrawerLineProps = {
  item: CartItem;
  isRemoving: boolean;
  onRemove: (itemId: string) => void;
};

export function CartDrawerLine({
  item,
  isRemoving,
  onRemove,
}: CartDrawerLineProps) {
  const productHref = `/products/${item.product.slug}`;

  return (
    <article
      className="flex gap-3 border-b border-border py-4"
      aria-busy={isRemoving}
    >
      <div className="relative aspect-[4/5] w-14 shrink-0">
        <div className="plate plate-sm absolute inset-0 overflow-hidden">
          <Image
            src={cldUrl(item.product.imageUrl, {
              width: 128,
              height: 160,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              format: "auto",
            })}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={productHref}
            className="line-clamp-2 min-w-0 font-heading text-base leading-tight font-normal text-foreground hover:underline"
          >
            {item.product.name}
          </Link>
          <span className="shrink-0 text-xs figures">
            <Money value={item.lineTotal} />
          </span>
        </div>

        {item.color !== null || item.size !== null ? (
          <p className="text-2xs text-muted-foreground">
            {item.color}
            {item.color !== null && item.size !== null ? (
              <span aria-hidden="true"> · </span>
            ) : null}
            {item.size}
          </p>
        ) : null}

        <p className="text-2xs text-muted-foreground figures">
          {item.quantity} &times; <Money value={item.price} />
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={isRemoving}
        aria-label={
          isRemoving
            ? `Removing ${item.product.name} from cart`
            : `Remove ${item.product.name} from cart`
        }
        onClick={() => onRemove(item.id)}
      >
        {isRemoving ? (
          <LucideLoaderCircle className="animate-spin" />
        ) : (
          <LucideTrash2 />
        )}
      </Button>
    </article>
  );
}
