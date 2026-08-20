"use client";

import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import FormControl from "@/components/shared/form-control";
import SubmitButton from "@/components/shared/submit-button";
import { updateProfilePhoneAction } from "@/features/profile/actions/update-profile-phone-action";

type ProfilePhoneFormProps = {
  phone: string | null;
};

function payloadString(
  payload: ActionState["payload"],
  key: string,
): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" ? value : undefined;
}

export function ProfilePhoneForm({ phone }: ProfilePhoneFormProps) {
  const [actionState, action] = useActionState(
    updateProfilePhoneAction,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form action={action} actionState={actionState}>
      <FormControl
        label="Phone"
        name="phone"
        type="tel"
        actionState={actionState}
        defaultValue={
          payloadString(actionState.payload, "phone") ?? phone ?? ""
        }
        autoComplete="tel"
      />
      <SubmitButton label="Save phone" />
    </Form>
  );
}
