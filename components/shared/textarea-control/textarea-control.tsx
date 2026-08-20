import type { ComponentProps } from "react";

import FieldError from "@/components/shared/form/field-error";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export type TextareaControlProps = ComponentProps<"textarea"> & {
  label: string;
  name: string;
  actionState?: ActionState;
  error?: string;
};

export function TextareaControl({
  label,
  name,
  error,
  actionState,
  ...restProps
}: TextareaControlProps) {
  const hasError = Boolean(error || actionState?.fieldErrors[name]?.length);
  const errorId = `${name}-error`;

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Textarea
          id={name}
          name={name}
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
}
