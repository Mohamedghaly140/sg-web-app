import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge } from "@/features/products/components/discount-badge";
import { StockBadge } from "@/features/products/components/stock-badge";
import type { ProductSummary } from "@/features/products/types/product";
import { WishlistHeart } from "@/features/wishlist/components/wishlist-heart";
import { cn } from "@/lib/utils";

/* The card is shared by two different layouts, so its `sizes` hint cannot be a
   single constant: a grid cell and a fixed-width rail card resolve to very
   different widths at the same viewport. Under-requesting makes Next pick an
   undersized source and stretch it, so each consumer declares its own. */
export const PRODUCT_CARD_GRID_SIZES =
  "(min-width: 1280px) 288px, (min-width: 1024px) calc(25vw - 32px), (min-width: 768px) calc(33.333vw - 31px), (min-width: 640px) calc(50vw - 37px), calc(50vw - 28px)";

/* The capped account content column is 959.6px after its real 36.8px layout
   gap, 210px subnav, and 73.6px horizontal padding. Two real 18.4px grid gaps
   leave 307.6px per card; the plate's 6px mat on each side leaves a 295.6px
   image. The lower rungs use the same measured spacing for the two-column
   account grid before it becomes three columns at `lg`. */
export const PRODUCT_CARD_ACCOUNT_GRID_SIZES =
  "(min-width: 1280px) 296px, (min-width: 1024px) calc(33.333vw - 131px), (min-width: 640px) calc(50vw - 172px), calc(50vw - 163px)";

type ProductCardProps = {
  product: ProductSummary;
  className?: string;
  /** Next.js `sizes`. Defaults to the 4-column grid ladder used by the home
      bands and the listing; rail consumers must pass their own card widths. */
  imageSizes?: string;
  unavailable?: boolean;
  meta?: ReactNode;
};

export function ProductCard({
  product,
  className,
  imageSizes = PRODUCT_CARD_GRID_SIZES,
  unavailable = false,
  meta,
}: ProductCardProps) {
  const isDiscounted = Number(product.discount) > 0;
  const isSoldOut = product.quantity === 0;
  const colorSubtitle =
    product.colors.length > 0 ? product.colors.join(", ") : null;

  const content = (
    <>
      <div className="relative aspect-[3/4] border-b border-border bg-muted">
        <div className="plate relative h-full w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={imageSizes}
            className={cn(
              "object-cover transition-transform duration-300",
              !unavailable && "group-hover:scale-105",
            )}
          />
        </div>
        <div className="absolute left-3 top-3 z-10">
          {unavailable ? (
            <Badge variant="secondary">No longer available</Badge>
          ) : (
            <StockBadge quantity={product.quantity} />
          )}
        </div>
      </div>
      <div className={cn("p-3", isSoldOut && !unavailable && "opacity-60")}>
        <p
          className={cn(
            "line-clamp-1 font-heading text-lg font-semibold text-foreground transition-colors",
            !unavailable && "group-hover:text-accent-strong",
          )}
        >
          {product.name}
        </p>
        {colorSubtitle ? (
          <p className="text-xs text-muted-foreground">{colorSubtitle}</p>
        ) : null}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            <Money value={product.priceAfterDiscount} />
          </span>
          {isDiscounted ? (
            <span className="text-xs text-muted-foreground line-through">
              <Money value={product.price} />
            </span>
          ) : null}
          <span className="ml-auto">
            <DiscountBadge discount={product.discount} />
          </span>
        </div>
        {meta}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-border",
        unavailable && "opacity-60",
        className,
      )}
    >
      <WishlistHeart
        product={product}
        className="absolute right-2 top-2 z-20"
      />
      {unavailable ? (
        <div className="flex flex-col">{content}</div>
      ) : (
        <Link
          href={`/products/${product.slug}`}
          className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      )}
    </div>
  );
}
