import { RatingSummary } from "@/components/shared/rating-summary";
import { ReviewList } from "@/features/reviews/components/review-list";
import { ReviewPagination } from "@/features/reviews/components/review-pagination";
import { reviewsSearchParamsCache } from "@/features/reviews/hooks/reviews-search-params";
import { getProductReviews } from "@/features/reviews/queries/get-product-reviews";

type ReviewsFeatureProps = {
  productId: string;
  ratingsAverage: string | null;
  ratingsQuantity: number;
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ReviewsFeature({
  productId,
  ratingsAverage,
  ratingsQuantity,
  searchParams,
}: ReviewsFeatureProps) {
  const { page, limit } = reviewsSearchParamsCache.parse(searchParams);
  const { reviews, meta } = await getProductReviews(productId, page, limit);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Reviews
        </h2>
        <RatingSummary
          ratingsAverage={ratingsAverage}
          ratingsQuantity={ratingsQuantity}
        />
      </div>
      <ReviewList reviews={reviews} />
      <ReviewPagination meta={meta} />
    </section>
  );
}
