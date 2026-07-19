import { ActionState } from "@/components/shared/form/utils/to-action-state";
import { useEffect, useRef } from "react";

type OnArgs = {
  actionState: ActionState;
};

type UseActionFeedbackOptions = {
  onSuccess?: (args: OnArgs) => void;
  onError?: (args: OnArgs) => void;
};

export const useActionFeedback = (
  actionState: ActionState,
  options: UseActionFeedbackOptions
) => {
  const prevTimestamp = useRef<number>(actionState.timestamp);

  useEffect(() => {
    if (prevTimestamp.current === actionState.timestamp) return;

    if (actionState.status === "SUCCESS") {
      options.onSuccess?.({ actionState });
    }
    if (actionState.status === "ERROR") {
      options.onError?.({ actionState });
    }

    prevTimestamp.current = actionState.timestamp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState]);
};
