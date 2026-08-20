"use client";

import { useUser } from "@clerk/nextjs";
import { useActionState } from "react";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import FormControl from "@/components/shared/form-control";
import SubmitButton from "@/components/shared/submit-button";
import { updateProfileNameAction } from "@/features/profile/actions/update-profile-name-action";

type ProfileNameFormProps = {
  firstName: string;
  lastName: string;
};

function payloadString(
  payload: ActionState["payload"],
  key: string,
): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" ? value : undefined;
}

export function ProfileNameForm({
  firstName,
  lastName,
}: ProfileNameFormProps) {
  const { user } = useUser();
  const [actionState, action] = useActionState(
    updateProfileNameAction,
    EMPTY_ACTION_STATE,
  );

  return (
    <Form
      action={action}
      actionState={actionState}
      onSuccess={() => {
        void user?.reload();
      }}
    >
      <FormControl
        label="First name"
        name="firstName"
        actionState={actionState}
        defaultValue={
          payloadString(actionState.payload, "firstName") ?? firstName
        }
        autoComplete="given-name"
      />
      <FormControl
        label="Last name"
        name="lastName"
        actionState={actionState}
        defaultValue={
          payloadString(actionState.payload, "lastName") ?? lastName
        }
        autoComplete="family-name"
      />
      <SubmitButton label="Save name" />
    </Form>
  );
}
