"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import FormControl from "@/components/shared/form-control";
import { RatingInput } from "@/components/shared/rating-input/rating-input";
import SubmitButton from "@/components/shared/submit-button";
import { createReviewAction } from "@/features/reviews/actions/create-review";
import { updateReviewAction } from "@/features/reviews/actions/update-review";
import { DeleteReviewButton } from "@/features/reviews/components/delete-review-button";

type ReviewFormCreateProps = {
  mode: "create";
  productId: string;
  slug: string;
  onDone?: () => void;
};

type ReviewFormEditProps = {
  mode: "edit";
  productId: string;
  slug: string;
  reviewId: string;
  initialTitle?: string;
  initialRatings?: string;
  onDone?: () => void;
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
  const { productId, slug, onDone } = props;

  const [createState, createAction] = useActionState(
    createReviewAction,
    EMPTY_ACTION_STATE,
  );
  const [updateState, updateAction] = useActionState(
    updateReviewAction,
    EMPTY_ACTION_STATE,
  );

  const [recoveredEdit, setRecoveredEdit] = useState<RecoveredEdit | null>(
    null,
  );
  const [resumePage, setResumePage] = useState("1");
  const [awaitingResume, setAwaitingResume] = useState(false);

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

  useEffect(() => {
    if (createState.response?.code !== "REVIEW_EXISTS") return;
    const reviewId = createState.response.reviewId;
    if (typeof reviewId !== "string" || reviewId.length === 0) return;

    setAwaitingResume(false);
    setRecoveredEdit({
      reviewId,
      title:
        typeof createState.response.title === "string"
          ? createState.response.title
          : "",
      ratings:
        typeof createState.response.ratings === "string"
          ? createState.response.ratings
          : "",
    });
  }, [createState]);

  useEffect(() => {
    if (createState.response?.code !== "RETRY") return;
    const next = createState.response.resumePage;
    if (typeof next === "number" && next >= 1) {
      setResumePage(String(next));
    }
    setAwaitingResume(true);
  }, [createState]);

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

  return (
    <Form
      action={formAction}
      actionState={actionState}
      onSuccess={() => onDone?.()}
      className="rounded-md border border-border p-4"
    >
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
        key={`ratings-${isCreate ? "create" : editReviewId}-${ratingsDefault}`}
        name="ratings"
        label="Rating"
        defaultValue={ratingsDefault}
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
        <SubmitButton label={isCreate ? "Post review" : "Update review"} />
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
