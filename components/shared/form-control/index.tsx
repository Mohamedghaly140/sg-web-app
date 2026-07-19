import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import React from "react";
import FieldError from "../form/field-error";
import { ActionState } from "../form/utils/to-action-state";

export interface FormControlProps extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  actionState?: ActionState;
  error?: string;
}

const FormControl = ({
  label,
  name,
  error,
  type,
  actionState,
  ...restProps
}: FormControlProps) => {
  if (type === "hidden") {
    return <Input name={name} type={type} {...restProps} />;
  }

  const hasError = Boolean(
    error || actionState?.fieldErrors[name]?.length,
  );
  const errorId = `${name}-error`;

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          name={name}
          type={type}
          {...restProps}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
        <FieldError
          id={errorId}
          name={name}
          error={error}
          actionState={actionState}
        />
      </FieldContent>
    </Field>
  );
};

export default FormControl;
