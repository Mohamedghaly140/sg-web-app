import Image from "next/image";
import Link from "next/link";
import { LucideLoaderCircle, LucideTrash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
      className="flex gap-3 border-b border-border py-4 last:border-b-0"
      aria-busy={isRemoving}
    >
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
        width={64}
        height={80}
        className="h-20 w-16 shrink-0 object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          href={productHref}
          className="line-clamp-2 font-heading text-sm font-medium text-foreground"
        >
          {item.product.name}
        </Link>

        {item.color !== null || item.size !== null ? (
          <div className="flex flex-wrap gap-1">
            {item.color !== null ? (
              <Badge variant="outline">Color: {item.color}</Badge>
            ) : null}
            {item.size !== null ? (
              <Badge variant="outline">Size: {item.size}</Badge>
            ) : null}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {item.quantity} &times; <Money value={item.price} />
        </p>
        <p className="text-sm font-medium text-foreground">
          <Money value={item.lineTotal} />
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
