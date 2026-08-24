import { Money } from "@/components/shared/money";
import { DiscountBadge } from "@/features/products/components/discount-badge";

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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-2xl font-semibold tracking-tight text-foreground">
        <Money value={priceAfterDiscount} />
      </span>
      {isDiscounted && (
        <>
          <span className="text-muted-foreground line-through">
            <Money value={price} />
          </span>
          <DiscountBadge discount={discount} />
        </>
      )}
    </div>
  );
}
