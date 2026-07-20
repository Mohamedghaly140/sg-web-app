import { LucideStar } from "lucide-react";

type RatingSummaryProps = {
  ratingsAverage: string | null;
  ratingsQuantity: number;
};

export function RatingSummary({ ratingsAverage, ratingsQuantity }: RatingSummaryProps) {
  if (ratingsAverage === null) {
    return <p className="text-sm text-muted-foreground">No reviews yet</p>;
  }

  return (
    <p className="flex items-center gap-1 text-sm text-foreground">
      <LucideStar className="size-4 fill-primary text-primary" aria-hidden />
      <span className="font-medium">{ratingsAverage}</span>
      <span className="text-muted-foreground">
        ({ratingsQuantity} {ratingsQuantity === 1 ? "review" : "reviews"})
      </span>
    </p>
  );
}
