import { LucideStar } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingSummaryProps = {
  ratingsAverage: string | null;
  ratingsQuantity: number;
  /**
   * `compact` is S3's buy-box line: 12.5px, wholly muted, "★ 4.5 · 12 reviews"
   * with a middot instead of the default's parenthesised count. `default` stays
   * as-is for the reviews-section heading, where it sits beside an `h2`.
   */
  variant?: "default" | "compact";
};

export function RatingSummary({
  ratingsAverage,
  ratingsQuantity,
  variant = "default",
}: RatingSummaryProps) {
  const compact = variant === "compact";

  if (ratingsAverage === null) {
    return (
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        No reviews yet
      </p>
    );
  }

  const reviewLabel = ratingsQuantity === 1 ? "review" : "reviews";

  if (compact) {
    return (
      <p className="figures flex items-center gap-1 text-xs text-muted-foreground">
        <LucideStar className="size-3 fill-accent text-accent" aria-hidden />
        <span>{ratingsAverage}</span>
        <span aria-hidden>·</span>
        <span>
          {ratingsQuantity} {reviewLabel}
        </span>
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1 text-sm text-foreground">
      <LucideStar className="size-3.5 fill-accent text-accent" aria-hidden />
      <span className="font-medium">{ratingsAverage}</span>
      <span className="text-muted-foreground">
        ({ratingsQuantity} {reviewLabel})
      </span>
    </p>
  );
}
