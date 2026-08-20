"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { useActionFeedback } from "@/components/shared/form/hooks/use-action-feedback";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { deleteReviewAction } from "@/features/reviews/actions/delete-review";

export type DeleteReviewButtonProps = {
  reviewId: string;
  productId: string;
  slug: string;
  onDeleted?: () => void;
};

export function DeleteReviewButton({
  reviewId,
  productId,
  slug,
  onDeleted,
}: DeleteReviewButtonProps) {
  const [state, formAction, isPending] = useActionState(
    deleteReviewAction,
    EMPTY_ACTION_STATE,
  );
  const [, startTransition] = useTransition();

  useActionFeedback(state, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }
      onDeleted?.();
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message);
      }
    },
  });

  return (
    <ConfirmDialog
      title="Delete this review?"
      description="This cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      trigger={
        <Button type="button" variant="destructive" disabled={isPending}>
          Delete
        </Button>
      }
      onConfirm={() => {
        const fd = new FormData();
        fd.set("reviewId", reviewId);
        fd.set("productId", productId);
        fd.set("slug", slug);
        startTransition(() => {
          formAction(fd);
        });
      }}
    />
  );
}
