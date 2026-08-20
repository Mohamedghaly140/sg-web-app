"use client";

import Image from "next/image";
import Link from "next/link";

import { RatingSummary } from "@/components/shared/rating-summary";
import { WishlistHeart } from "@/features/wishlist/components/wishlist-heart";
import type { WishlistEntry } from "@/features/wishlist/types/wishlist";
import { cldUrl, formatEGP } from "@/lib/format";
import { cn } from "@/lib/utils";

type WishlistItemProps = {
  entry: WishlistEntry;
};

const addedAtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function WishlistItem({ entry }: WishlistItemProps) {
  const { product, addedAt, available } = entry;
  const isSoldOut = available && product.quantity <= 0;
  const isDiscounted = Number(product.discount) > 0;
  const addedAtLabel = addedAtFormatter.format(new Date(addedAt));

  const media = (
    <div className="relative size-24 overflow-hidden bg-muted sm:size-32">
      <Image
        src={cldUrl(product.imageUrl, {
          width: 256,
          height: 256,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          format: "auto",
        })}
        alt={product.name}
        fill
        sizes="(min-width: 640px) 128px, 96px"
        className="object-cover"
      />
    </div>
  );

  const details = (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="font-heading text-base font-medium text-foreground">
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
        {isDiscounted ? (
          <span className="text-xs text-muted-foreground line-through">
            {formatEGP(product.price)}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Added {addedAtLabel}</p>
      {!available ? (
        <p className="text-xs text-destructive" role="status">
          No longer available
        </p>
      ) : null}
      {isSoldOut ? (
        <p className="text-xs text-muted-foreground" role="status">
          Sold out
        </p>
      ) : null}
    </div>
  );

  return (
    <li>
      <article
        className={cn(
          "grid grid-cols-[6rem_minmax(0,1fr)_auto] gap-4 p-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:p-5",
          !available && "opacity-60",
        )}
      >
        {available ? (
          <Link
            href={`/products/${product.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {media}
          </Link>
        ) : (
          <div aria-disabled="true">{media}</div>
        )}

        {available ? (
          <Link
            href={`/products/${product.slug}`}
            className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {details}
          </Link>
        ) : (
          <div aria-disabled="true" className="min-w-0">
            {details}
          </div>
        )}

        <div className="self-start">
          <WishlistHeart product={product} />
        </div>
      </article>
    </li>
  );
}
