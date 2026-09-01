"use client";

import {
  useActionState,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import Form from "@/components/shared/form/form";
import {
  EMPTY_ACTION_STATE,
  type ActionState,
} from "@/components/shared/form/utils/to-action-state";
import SubmitButton from "@/components/shared/submit-button";
import { createAddressAction } from "@/features/addresses/actions/create-address";
import { updateAddressAction } from "@/features/addresses/actions/update-address";
import {
  AddressFormFields,
  type AddressFieldValues,
} from "@/features/addresses/components/address-form-fields";
import type { Address } from "@/features/addresses/types/address";

type AddressFormSharedProps = {
  onDone?: () => void;
  layout?: "stack" | "grid";
  columns?: 2 | 3;
  onDestinationChange?: (destination: {
    country: string;
    governorate: string;
    city: string;
  }) => void;
  footer?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

type AddressFormCreateProps = AddressFormSharedProps & {
  variant: "create";
  hasExistingAddresses: boolean;
};

type AddressFormEditProps = AddressFormSharedProps & {
  variant: "edit";
  address: Address;
};

export type AddressFormProps = AddressFormCreateProps | AddressFormEditProps;

function addressToFieldValues(address: Address): AddressFieldValues {
  return {
    alias: address.alias,
    governorate: address.governorate,
    city: address.city,
    area: address.area,
    phone: address.phone,
    addressLine1: address.addressLine1,
    details: address.details,
    postalCode:
      address.postalCode === null ? "" : String(address.postalCode),
    latitude: address.latitude === null ? "" : String(address.latitude),
    longitude: address.longitude === null ? "" : String(address.longitude),
  };
}

export function AddressForm(props: AddressFormProps) {
  const isCreate = props.variant === "create";

  const [createState, createAction] = useActionState(
    createAddressAction,
    EMPTY_ACTION_STATE,
  );
  const [editState, setEditState] = useState<ActionState>(EMPTY_ACTION_STATE);
  const [, startEditTransition] = useTransition();

  const actionState: ActionState = isCreate ? createState : editState;
  const defaultValues = isCreate
    ? undefined
    : addressToFieldValues(props.address);

  const formAction = isCreate
    ? createAction
    : (formData: FormData) => {
        startEditTransition(() => {
          void (async () => {
            const result = await updateAddressAction(editState, formData);
            setEditState(result);
            if (result.status === "ERROR") {
              if (result.message) toast.error(result.message);
            } else if (result.message) {
              toast.success(result.message);
              props.onDone?.();
            }
          })();
        });
      };

  return (
    <Form
      action={formAction}
      actionState={actionState}
      onSuccess={isCreate ? () => props.onDone?.() : undefined}
      suppressBuiltInToasts={!isCreate}
      className={
        props.className ?? "rounded-md border border-border p-4"
      }
    >
      {!isCreate ? (
        <input type="hidden" name="id" value={props.address.id} />
      ) : null}

      <AddressFormFields
        mode="registered"
        layout={props.layout}
        columns={props.columns}
        defaultValues={defaultValues}
        actionState={actionState}
        onDestinationChange={props.onDestinationChange}
      />

      {isCreate && !props.hasExistingAddresses ? (
        <p className="text-sm text-muted-foreground">
          This will be your default address.
        </p>
      ) : null}

      {props.footer}

      {props.actions ?? (
        <SubmitButton
          label={isCreate ? "Save address" : "Update address"}
        />
      )}
    </Form>
  );
}
