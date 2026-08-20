"use client";

import { useState } from "react";

import FieldError from "@/components/shared/form/field-error";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectFieldProps = {
  name: string;
  label: string;
  options: readonly string[];
  actionState?: ActionState;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
};

export function SelectField({
  name,
  label,
  options,
  actionState,
  error,
  defaultValue = "",
  placeholder = "Select…",
  disabled = false,
  onValueChange,
}: SelectFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const hasError = Boolean(error || actionState?.fieldErrors[name]?.length);
  const errorId = `${name}-error`;

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <input type="hidden" name={name} value={value} />
        <Select
          value={value || undefined}
          disabled={disabled}
          onValueChange={(next) => {
            if (next == null) return;
            setValue(next);
            onValueChange?.(next);
          }}
        >
          <SelectTrigger
            id={name}
            className="w-full"
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
