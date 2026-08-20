import Image from "next/image";
import Link from "next/link";

import { RatingSummary } from "@/components/shared/rating-summary";
import { DiscountBadge } from "@/features/products/components/discount-badge";
import { StockBadge } from "@/features/products/components/stock-badge";
import type { ProductSummary } from "@/features/products/types/product";
import { WishlistHeart } from "@/features/wishlist/components/wishlist-heart";
import { formatEGP } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductSummary;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const isDiscounted = Number(product.discount) > 0;

  return (
    <div className={cn("group relative flex flex-col gap-2", className)}>
      <WishlistHeart
        product={product}
        className="absolute right-2 top-2 z-20"
      />
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {/* Square: merchandise photography stays sharp-edged, see category-tile.tsx for the rounded navigational-imagery counterpart. */}
        <div className="relative aspect-square overflow-hidden rounded-none bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 224px, 75vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 z-10">
            <DiscountBadge discount={product.discount} />
          </div>
        </div>
        <p className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
          {product.name}
        </p>
        <RatingSummary
          ratingsAverage={product.ratingsAverage}
          ratingsQuantity={product.ratingsQuantity}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatEGP(product.priceAfterDiscount)}
          </span>
          {isDiscounted && (
            <span className="text-xs text-muted-foreground line-through">
              {formatEGP(product.price)}
            </span>
          )}
        </div>
        <StockBadge quantity={product.quantity} />
      </Link>
    </div>
  );
}
