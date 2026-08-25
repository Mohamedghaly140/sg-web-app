"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

/* The Classical radio is the handoff's `.radio .dot`: a 16px circle with a
   1.5px divider border, filling with accent when checked and cutting the dot
   out of that fill with a 4px inset ring of the page background.

   The shadcn generator ships a stroked `LucideCircle` scaled to `size-2`
   instead, which renders as a heavy off-centre donut rather than a dot -- the
   icon's `stroke-width: 2` is set against a 24px viewBox, so shrinking it to
   8px leaves a ring thicker than the dot it is meant to be. Painting the dot in
   CSS also keeps it theme-correct for free, since both tokens are redefined
   under the dark palette. */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border-[1.5px] border-border bg-transparent transition-colors outline-none",
        "hover:border-foreground/45",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "data-checked:border-accent data-checked:bg-accent",
        "data-disabled:cursor-not-allowed data-disabled:opacity-45",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="block size-full rounded-full shadow-[inset_0_0_0_4px_var(--color-background)]"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
