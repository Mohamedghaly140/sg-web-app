import { auth } from "@clerk/nextjs/server";

import { RatingSummary } from "@/components/shared/rating-summary";
import { ReviewList } from "@/features/reviews/components/review-list";
import { ReviewPagination } from "@/features/reviews/components/review-pagination";
import { YourReviewSection } from "@/features/reviews/components/your-review-section";
import { reviewsSearchParamsCache } from "@/features/reviews/hooks/reviews-search-params";
import { getProductReviews } from "@/features/reviews/queries/get-product-reviews";

type ReviewsFeatureProps = {
  productId: string;
  slug: string;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ReviewsFeature({
  productId,
  slug,
  ratingsAverage,
  ratingsQuantity,
  searchParams,
}: ReviewsFeatureProps) {
  const { userId } = await auth();
  const { page, limit } = reviewsSearchParamsCache.parse(searchParams);
  const { reviews, meta } = await getProductReviews(productId, page, limit);

  return (
    <section id="reviews" className="flex flex-col gap-4">
      {/* One reviews surface, not two. The design's below-fold band listed the
          same reviews this section already shows, so it was deleted and its
          rating meta kept here beside the heading. Hairline band-header idiom
          from Phase 9.3, matching the listing's title band and the related
          rail. */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
        <h2 className="font-heading text-2xl text-foreground">Reviews</h2>
        <RatingSummary
          variant="compact"
          ratingsAverage={ratingsAverage}
          ratingsQuantity={ratingsQuantity}
        />
      </div>
      {/* Below the hairline, not in the header row: this expands into the
          full-width write/edit form. */}
      <YourReviewSection
        reviews={reviews}
        currentUserId={userId}
        productId={productId}
        slug={slug}
      />
      <ReviewList reviews={reviews} currentUserId={userId} />
      <ReviewPagination meta={meta} />
    </section>
  );
}
