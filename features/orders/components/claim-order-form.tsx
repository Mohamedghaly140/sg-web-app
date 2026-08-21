"use client";

import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import SubmitButton from "@/components/shared/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ClaimOrderFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function ClaimOrderForm({ action }: ClaimOrderFormProps) {
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Form action={formAction} actionState={actionState} suppressBuiltInToasts>
      {actionState.status === "ERROR" && actionState.message ? (
        <Alert variant="destructive">
          <AlertDescription>{actionState.message}</AlertDescription>
        </Alert>
      ) : null}
      <SubmitButton label="Claim this order" />
    </Form>
  );
}
