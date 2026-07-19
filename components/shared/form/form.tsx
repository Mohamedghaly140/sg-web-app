import { useActionFeedback } from "@/components/shared/form/hooks/use-action-feedback";
import { ActionState } from "@/components/shared/form/utils/to-action-state";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "sonner";

type FormProps = {
  children: React.ReactNode;
  actionState: ActionState;
  action: (formData: FormData) => void;
  className?: string;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
  /**
   * When true, skips the default success/error toasts from `useActionFeedback`.
   * Use for actions that unmount the submitting UI on success (e.g. delete row +
   * `revalidatePath`) — show toasts synchronously in a client wrapper around the
   * server action instead.
   */
  suppressBuiltInToasts?: boolean;
};

const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  {
    children,
    action,
    actionState,
    className,
    onSuccess,
    onError,
    suppressBuiltInToasts = false,
  },
  ref,
) {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (!suppressBuiltInToasts && actionState.message) {
        toast.success(actionState.message);
      }
      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (!suppressBuiltInToasts && actionState.message) {
        toast.error(actionState.message);
      }
      onError?.(actionState);
    },
  });

  return (
    <form
      ref={ref}
      action={action}
      className={cn("flex flex-col gap-4 w-full", className)}
    >
      {children}
    </form>
  );
});

export default Form;
