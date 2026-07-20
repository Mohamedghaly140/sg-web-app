import Image from "next/image";
import Link from "next/link";

import { RatingSummary } from "@/components/shared/rating-summary";
import { DiscountBadge } from "@/features/products/components/discount-badge";
import { StockBadge } from "@/features/products/components/stock-badge";
import { formatEGP } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/features/products/types/product";

type ProductCardProps = {
  product: ProductSummary;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const isDiscounted = Number(product.discount) > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-none bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 640px) 224px, 75vw"
          className="object-cover"
        />
        <div className="absolute left-2 top-2 z-10">
          <DiscountBadge discount={product.discount} />
        </div>
      </div>
      <p className="line-clamp-1 text-sm font-medium text-foreground">
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
  );
}
