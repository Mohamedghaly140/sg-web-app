"use client";

import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import FormControl from "@/components/shared/form-control";
import SubmitButton from "@/components/shared/submit-button";
import { claimGuestOrderFromAccountAction } from "@/features/account/actions/claim-guest-order";

export function AccountClaimOrderForm() {
  const [actionState, formAction] = useActionState(
    claimGuestOrderFromAccountAction,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form
      action={formAction}
      actionState={actionState}
      className="sm:flex-row sm:items-end"
    >
      <FormControl
        name="token"
        label="Tracking code"
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="Tracking code"
        actionState={actionState}
      />
      <SubmitButton label="Claim" className="sm:shrink-0" />
    </Form>
  );
}
