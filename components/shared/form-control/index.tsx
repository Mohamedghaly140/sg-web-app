import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import FieldError from "../form/field-error";
import { ActionState } from "../form/utils/to-action-state";

interface FormControlProps extends React.ComponentProps<"input"> {
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
    <div className="flex flex-col gap-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        {...restProps}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError ? (
        <div id={errorId} className="flex flex-col gap-y-2">
          {error && <p className="text-red-500">{error}</p>}
          {actionState && <FieldError name={name} actionState={actionState} />}
        </div>
      ) : null}
    </div>
  );
};

export default FormControl;
