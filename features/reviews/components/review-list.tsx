import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/features/reviews/types/review";
import { formatDate } from "@/lib/format";

type ReviewListProps = {
  reviews: Review[];
  currentUserId?: string | null;
};

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  if (reviews.length === 0) {
    /* The Classical system has no filled illustration slots in a text band, so
       an empty review list is a quiet line over the section hairline rather
       than an EmptyState card with an icon tile. */
    return (
      <p className="text-xs text-muted-foreground">
        No reviews yet — be the first to write one.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border border-t border-border">
      {reviews.map((review) => {
        const isOwn = currentUserId != null && review.user.id === currentUserId;

        return (
          <li key={review.id} className="flex flex-col gap-1 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <RatingStars value={review.ratings} size={13} />
              <span className="figures text-xs text-foreground">
                {review.ratings}
              </span>
              {isOwn ? <Badge variant="outline">Your review</Badge> : null}
            </div>
            {review.title && (
              <p className="font-heading text-lg text-foreground">
                {review.title}
              </p>
            )}
            <p className="figures text-[11.5px] text-muted-foreground">
              {review.user.name} · {formatDate(review.createdAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
