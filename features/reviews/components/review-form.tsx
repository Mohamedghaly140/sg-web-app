"use client";

import { useState } from "react";
import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import FormControl from "@/components/shared/form-control";
import { RatingInput } from "@/components/shared/rating-input/rating-input";
import SubmitButton from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { createReviewAction } from "@/features/reviews/actions/create-review";
import { updateReviewAction } from "@/features/reviews/actions/update-review";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";

type ReviewFormCreateProps = {
  mode: "create";
  productId: string;
  slug: string;
  onDone?: () => void;
  onCancel?: () => void;
};

type ReviewFormEditProps = {
  mode: "edit";
  productId: string;
  slug: string;
  reviewId: string;
  initialTitle?: string;
  initialRatings?: string;
  onDone?: () => void;
  onCancel?: () => void;
};

export type ReviewFormProps = ReviewFormCreateProps | ReviewFormEditProps;

type RecoveredEdit = {
  reviewId: string;
  title: string;
  ratings: string;
};

/**
 * Two `useActionState` hooks stay mounted (hooks rules). Create mode can
 * self-switch into edit when GAP-2 returns `REVIEW_EXISTS` with the owned
 * review payload — then the update action + recovered fields take over.
 */
export function ReviewForm(props: ReviewFormProps) {
  const { productId, slug, onDone, onCancel } = props;

  const [createState, createAction] = useActionState(
    createReviewAction,
    EMPTY_ACTION_STATE,
  );
  const [updateState, updateAction] = useActionState(
    updateReviewAction,
    EMPTY_ACTION_STATE,
  );

  const [resumePage, setResumePage] = useState("1");
  // Mirrors RatingInput's selection so submit can be gated. Null means
  // "untouched since the last remount", in which case the default stands.
  const [pickedRating, setPickedRating] = useState<string | null>(null);
  const [awaitingResume, setAwaitingResume] = useState(false);

  // Derived straight from `createState` rather than mirrored into its own
  // state + effect: once `createAction` returns `REVIEW_EXISTS` we never call
  // it again (create-mode fully hands off to `updateAction`), so `createState`
  // stays pinned at that response and recomputing this every render is
  // equivalent to the old effect-driven copy.
  const recoveredEdit: RecoveredEdit | null =
    createState.response?.code === "REVIEW_EXISTS" &&
    typeof createState.response.reviewId === "string" &&
    createState.response.reviewId.length > 0
      ? {
          reviewId: createState.response.reviewId,
          title:
            typeof createState.response.title === "string"
              ? createState.response.title
              : "",
          ratings:
            typeof createState.response.ratings === "string"
              ? createState.response.ratings
              : "",
        }
      : null;

  const isCreate = props.mode === "create" && recoveredEdit === null;
  const actionState: ActionState = isCreate ? createState : updateState;
  const formAction = isCreate ? createAction : updateAction;

  const editReviewId =
    recoveredEdit?.reviewId ??
    (props.mode === "edit" ? props.reviewId : undefined);
  const initialTitle =
    recoveredEdit?.title ??
    (props.mode === "edit" ? props.initialTitle : undefined);
  const initialRatings =
    recoveredEdit?.ratings ??
    (props.mode === "edit" ? props.initialRatings : undefined);

  // React's "adjusting state during render" pattern (not an effect): fires
  // exactly once per new `createState`, same as the effect it replaces, but
  // avoids a set-state-only effect (react-hooks/set-state-in-effect). The
  // `REVIEW_EXISTS` case needs no branch here — `recoveredEdit` above is
  // derived straight from `createState`, so there's nothing left to persist.
  const [processedCreateState, setProcessedCreateState] = useState(createState);
  if (processedCreateState !== createState) {
    setProcessedCreateState(createState);
    if (createState.response?.code === "RETRY") {
      const next = createState.response.resumePage;
      if (typeof next === "number" && next >= 1) {
        setResumePage(String(next));
      }
      setAwaitingResume(true);
    }
  }

  const titleDefault =
    (typeof actionState.payload?.title === "string"
      ? actionState.payload.title
      : undefined) ??
    initialTitle ??
    "";
  const ratingsDefault =
    (typeof actionState.payload?.ratings === "string"
      ? actionState.payload.ratings
      : undefined) ??
    initialRatings ??
    "";

  const ratingFieldKey = `ratings-${isCreate ? "create" : editReviewId}-${ratingsDefault}`;

  // RatingInput is remounted by key whenever the defaults change (a failed
  // submit, or create self-switching into edit), which resets its internal
  // state -- so drop the mirrored value at the same time, during render
  // rather than via a set-state-only effect.
  const [processedRatingFieldKey, setProcessedRatingFieldKey] = useState(ratingFieldKey);
  if (processedRatingFieldKey !== ratingFieldKey) {
    setProcessedRatingFieldKey(ratingFieldKey);
    setPickedRating(null);
  }

  const effectiveRating = pickedRating ?? ratingsDefault;

  return (
    <Form
      action={formAction}
      actionState={actionState}
      onSuccess={() => onDone?.()}
      className="flex flex-col gap-4 border border-border p-4"
    >
      <p className="text-eyebrow">
        {isCreate ? "Write a review" : "Edit your review"}
      </p>
      <FormControl
        key={`title-${isCreate ? "create" : editReviewId}-${titleDefault}`}
        name="title"
        label="Title"
        type="text"
        maxLength={150}
        defaultValue={titleDefault}
        actionState={actionState}
      />
      <RatingInput
        key={ratingFieldKey}
        name="ratings"
        label="Rating"
        defaultValue={ratingsDefault}
        onValueChange={setPickedRating}
        actionState={actionState}
      />
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      {editReviewId ? (
        <input type="hidden" name="reviewId" value={editReviewId} />
      ) : null}
      {isCreate ? (
        <>
          <input type="hidden" name="resumePage" value={resumePage} />
          <input
            type="hidden"
            name="resumeSearch"
            value={awaitingResume ? "true" : "false"}
          />
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {/* The contract rejects a missing rating, so block the round trip
            rather than bouncing the shopper off a server error. */}
        <SubmitButton
          label={isCreate ? "Post review" : "Update review"}
          disabled={effectiveRating === ""}
        />
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {recoveredEdit !== null ? (
          <DeleteReviewButton
            reviewId={recoveredEdit.reviewId}
            productId={productId}
            slug={slug}
            onDeleted={() => onDone?.()}
          />
        ) : null}
      </div>
    </Form>
  );
}
