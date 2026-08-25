import Image from "next/image";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { DiscountBadge } from "@/features/products/components/discount-badge";
import { StockBadge } from "@/features/products/components/stock-badge";
import type { ProductSummary } from "@/features/products/types/product";
import { WishlistHeart } from "@/features/wishlist/components/wishlist-heart";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductSummary;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const isDiscounted = Number(product.discount) > 0;
  const isSoldOut = product.quantity === 0;
  const colorSubtitle =
    product.colors.length > 0 ? product.colors.join(", ") : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-border",
        className,
      )}
    >
      <WishlistHeart
        product={product}
        className="absolute right-2 top-2 z-20"
      />
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[3/4] border-b border-border bg-muted">
          <div className="plate relative h-full w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 224px, 75vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="absolute left-3 top-3 z-10">
            <StockBadge quantity={product.quantity} />
          </div>
        </div>
        <div className={cn("p-3", isSoldOut && "opacity-60")}>
          <p className="line-clamp-1 font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-accent-strong">
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
        </div>
      </Link>
    </div>
  );
}
