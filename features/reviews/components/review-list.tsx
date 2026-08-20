import { LucideMessageSquare, LucideStar } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/features/reviews/types/review";
import { formatDate } from "@/lib/format";

type ReviewListProps = {
  reviews: Review[];
  currentUserId?: string | null;
};

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
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
      {reviews.map((review) => {
        const isOwn =
          currentUserId != null && review.user.id === currentUserId;

        return (
          <li key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                <LucideStar
                  className="size-4 fill-primary text-primary"
                  aria-hidden
                />
                {review.ratings}
              </p>
              {isOwn ? <Badge variant="info">Your review</Badge> : null}
            </div>
            {review.title && (
              <h3 className="font-medium text-foreground">{review.title}</h3>
            )}
            <p className="text-sm text-muted-foreground">
              {review.user.name} · {formatDate(review.createdAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
