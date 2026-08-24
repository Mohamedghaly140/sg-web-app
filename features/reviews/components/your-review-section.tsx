"use client";

import { useState } from "react";

import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";
import { ReviewForm } from "@/features/reviews/components/review-form";
import type { Review } from "@/features/reviews/types/review";
import { formatDate } from "@/lib/format";
import { LucideStar } from "lucide-react";

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
      <div className="flex flex-col gap-4 border border-border p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Your review</p>
          <p className="flex items-center gap-1 text-sm font-medium text-foreground">
            <LucideStar
              className="size-3.5 fill-primary text-primary"
              aria-hidden
            />
            {ownReview.ratings}
          </p>
          {ownReview.title ? (
            <h3 className="font-medium text-foreground">{ownReview.title}</h3>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {formatDate(ownReview.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEditForm((open) => !open)}
          >
            {showEditForm ? "Cancel" : "Edit"}
          </Button>
          <DeleteReviewButton
            reviewId={ownReview.id}
            productId={productId}
            slug={slug}
            onDeleted={() => setShowEditForm(false)}
          />
        </div>
        {showEditForm ? (
          <ReviewForm
            mode="edit"
            productId={productId}
            slug={slug}
            reviewId={ownReview.id}
            initialTitle={ownReview.title}
            initialRatings={ownReview.ratings}
            onDone={() => setShowEditForm(false)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <RequireAuth
        title="Sign in to write a review"
        description="Share your experience with this product after signing in."
        trigger={
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCreateForm((open) => !open)}
          >
            {showCreateForm ? "Cancel" : "Write a review"}
          </Button>
        }
      />
      {showCreateForm ? (
        <ReviewForm
          mode="create"
          productId={productId}
          slug={slug}
          onDone={() => setShowCreateForm(false)}
        />
      ) : null}
    </div>
  );
}
