"use client";

import { useState } from "react";

import { RatingStars } from "@/components/shared/rating-stars";
import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";
import { ReviewForm } from "@/features/reviews/components/review-form";
import type { Review } from "@/features/reviews/types/review";
import { formatDate } from "@/lib/format";

export type YourReviewSectionProps = {
  reviews: Review[];
  currentUserId: string | null;
  productId: string;
  slug: string;
};

export function YourReviewSection({
  reviews,
  currentUserId,
  productId,
  slug,
}: YourReviewSectionProps) {
  const ownReview =
    currentUserId === null
      ? undefined
      : reviews.find((review) => review.user.id === currentUserId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  if (ownReview) {
    return (
      <div className="flex flex-col gap-3 border border-border p-4">
        <p className="text-eyebrow">Your review</p>
        <div className="flex flex-wrap items-center gap-2">
          <RatingStars value={ownReview.ratings} size={15} />
          <span className="figures text-xs text-foreground">
            {ownReview.ratings} of 5
          </span>
        </div>
        {ownReview.title ? (
          <p className="font-heading text-lg text-foreground">
            {ownReview.title}
          </p>
        ) : null}
        <p className="figures text-[11.5px] text-muted-foreground">
          {formatDate(ownReview.createdAt)}
        </p>
        {showEditForm ? (
          <ReviewForm
            mode="edit"
            productId={productId}
            slug={slug}
            reviewId={ownReview.id}
            initialTitle={ownReview.title}
            initialRatings={ownReview.ratings}
            onDone={() => setShowEditForm(false)}
            onCancel={() => setShowEditForm(false)}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowEditForm(true)}
            >
              Edit
            </Button>
            <DeleteReviewButton
              reviewId={ownReview.id}
              productId={productId}
              slug={slug}
              onDeleted={() => setShowEditForm(false)}
            />
          </div>
        )}
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <ReviewForm
        mode="create"
        productId={productId}
        slug={slug}
        onDone={() => setShowCreateForm(false)}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <RequireAuth
      title="Sign in to write a review"
      description="Share your experience with this product after signing in."
      trigger={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => setShowCreateForm(true)}
        >
          Write a review
        </Button>
      }
    />
  );
}
