import { LucideMessageSquare, LucideStar } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { Review } from "@/features/reviews/types/review";
import { formatDate } from "@/lib/format";

type ReviewListProps = {
  reviews: Review[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={
          <LucideMessageSquare
            className="size-5 text-muted-foreground"
            aria-hidden
          />
        }
        title="No reviews yet"
        description="Be the first to review this product."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
          <p className="flex items-center gap-1 text-sm font-medium text-foreground">
            <LucideStar
              className="size-4 fill-primary text-primary"
              aria-hidden
            />
            {review.ratings}
          </p>
          {review.title && (
            <h3 className="font-medium text-foreground">{review.title}</h3>
          )}
          <p className="text-sm text-muted-foreground">
            {review.user.name} · {formatDate(review.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
