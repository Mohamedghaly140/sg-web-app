"use client";

import { LucideStar } from "lucide-react";
import { useState } from "react";

import FieldError from "@/components/shared/form/field-error";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const RATING_VALUES = [
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "4.5",
  "5",
] as const;

export type RatingInputProps = {
  name: string;
  label: string;
  actionState?: ActionState;
  error?: string;
  defaultValue?: string;
};

export function RatingInput({
  name,
  label,
  actionState,
  error,
  defaultValue = "",
}: RatingInputProps) {
  const [value, setValue] = useState(defaultValue);
  const hasError = Boolean(error || actionState?.fieldErrors[name]?.length);
  const errorId = `${name}-error`;

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <input type="hidden" name={name} value={value} />
        <ToggleGroup
          id={name}
          className="flex-wrap gap-1"
          spacing={1}
          aria-label={label}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          value={value ? [value] : []}
          onValueChange={(next) => {
            const nextValue = next[next.length - 1];
            if (nextValue) {
              setValue(nextValue);
            }
          }}
        >
          {RATING_VALUES.map((rating) => (
            <ToggleGroupItem
              key={rating}
              value={rating}
              type="button"
              variant="outline"
              size="sm"
              aria-label={`${rating} stars`}
              className="flex shrink-0 items-center gap-1 px-2"
            >
              <LucideStar className="size-3.5" aria-hidden />
              {rating}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
