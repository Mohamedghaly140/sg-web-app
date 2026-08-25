import { DiscountBadge } from "@/features/products/components/discount-badge";
import { formatAmount, formatEGP } from "@/lib/format";

type PriceBlockProps = {
  price: string;
  discount: string;
  priceAfterDiscount: string;
};

export function PriceBlock({
  price,
  discount,
  priceAfterDiscount,
}: PriceBlockProps) {
  const isDiscounted = Number(discount) > 0;

  return (
    <div className="figures flex items-baseline gap-3">
      <span className="font-heading text-[22px] text-foreground">
        {formatEGP(priceAfterDiscount)}
      </span>
      {isDiscounted && (
        <>
          <span className="text-[13px] text-muted-foreground line-through">
            {formatAmount(price)}
          </span>
          <DiscountBadge discount={discount} />
        </>
      )}
    </div>
  );
}
