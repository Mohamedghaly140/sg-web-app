"use client";

import { useState } from "react";
import { LucideStar } from "lucide-react";

import FieldError from "@/components/shared/form/field-error";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const STAR_SIZE = 28;

/**
 * The contract accepts 1–5 in 0.5 increments, so the lowest rating is a whole
 * star — there is no 0.5. The first star is therefore one full-width hit zone
 * for "1"; every star after it splits into a half and a whole.
 */
type HitZone = { value: number; half: boolean };

function hitZonesFor(star: number): HitZone[] {
  if (star === 1) {
    return [{ value: 1, half: false }];
  }

  return [
    { value: star - 0.5, half: true },
    { value: star, half: false },
  ];
}

function formatRating(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export type RatingInputProps = {
  name: string;
  label: string;
  actionState?: ActionState;
  error?: string;
  defaultValue?: string;
  /** Reports the chosen rating so a parent form can gate its submit. */
  onValueChange?: (value: string) => void;
};

export function RatingInput({
  name,
  label,
  actionState,
  error,
  defaultValue = "",
  onValueChange,
}: RatingInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [hovered, setHovered] = useState<number | null>(null);
  const hasError = Boolean(error || actionState?.fieldErrors[name]?.length);
  const errorId = `${name}-error`;

  const selected = Number(value);
  const selectedValue = Number.isFinite(selected) && selected > 0 ? selected : 0;
  // Hover previews the rating without committing it, so the stars answer
  // "what am I about to pick?" before the click.
  const shown = hovered ?? selectedValue;

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <div className="flex items-center gap-3">
          <div
            role="radiogroup"
            id={name}
            aria-label={label}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className="flex items-center gap-1"
            onMouseLeave={() => setHovered(null)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const fill = Math.min(1, Math.max(0, shown - (star - 1))) * 100;

              return (
                <span
                  key={star}
                  className="relative inline-block cursor-pointer rounded-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-solid"
                  style={{ width: STAR_SIZE, height: STAR_SIZE }}
                >
                  <LucideStar
                    className="absolute inset-0 text-muted-foreground/35 transition-colors"
                    style={{ width: STAR_SIZE, height: STAR_SIZE }}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  {fill > 0 && (
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${fill}%` }}
                    >
                      <LucideStar
                        className="fill-accent text-accent"
                        style={{ width: STAR_SIZE, height: STAR_SIZE }}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                  )}

                  {hitZonesFor(star).map((zone) => (
                    <label
                      key={zone.value}
                      className={cn(
                        "absolute inset-y-0",
                        star === 1
                          ? "inset-x-0"
                          : zone.half
                            ? "left-0 w-1/2"
                            : "right-0 w-1/2",
                      )}
                      onMouseEnter={() => setHovered(zone.value)}
                    >
                      <input
                        type="radio"
                        name={name}
                        value={formatRating(zone.value)}
                        checked={selectedValue === zone.value}
                        onChange={() => {
                          const next = formatRating(zone.value);
                          setValue(next);
                          onValueChange?.(next);
                        }}
                        aria-label={`${formatRating(zone.value)} out of 5`}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </span>
              );
            })}
          </div>

          <span
            className={cn(
              "figures text-xs",
              selectedValue > 0
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {shown > 0 ? `${formatRating(shown)} of 5` : "Select a rating"}
          </span>
        </div>

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
