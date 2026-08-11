"use client";

import { LucideMinus, LucidePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QuantityStepperProps = {
  value: number;
  onValueChange: (value: number) => void;
  /** Lowest selectable quantity. The API rejects zero; use the delete route. */
  min?: number;
  /** Highest selectable quantity, normally the product's current stock. */
  max: number;
  disabled?: boolean;
  /** Distinguishes the two buttons when several steppers share a page. */
  itemLabel?: string;
  className?: string;
};

export function QuantityStepper({
  value,
  onValueChange,
  min = 1,
  max,
  disabled = false,
  itemLabel,
  className,
}: QuantityStepperProps) {
  const suffix = itemLabel ? ` for ${itemLabel}` : "";
  const outOfStock = max < min;

  const step = (next: number) => {
    onValueChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div className={cn("flex items-center border border-border", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Decrease quantity${suffix}`}
        disabled={disabled || outOfStock || value <= min}
        onClick={() => step(value - 1)}
      >
        <LucideMinus data-icon="inline-start" />
      </Button>
      <output className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Increase quantity${suffix}`}
        disabled={disabled || outOfStock || value >= max}
        onClick={() => step(value + 1)}
      >
        <LucidePlus data-icon="inline-start" />
      </Button>
    </div>
  );
}
