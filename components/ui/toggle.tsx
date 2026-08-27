"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 data-pressed:text-accent-strong data-pressed:bg-transparent data-pressed:shadow-[inset_0_0_0_1px_var(--color-accent)] dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-primary/10 hover:text-accent-strong",
        tag: "rounded-sm border border-transparent bg-muted text-foreground shadow-none hover:bg-muted hover:text-foreground data-pressed:shadow-none data-pressed:border-primary data-pressed:bg-transparent data-pressed:text-accent-strong data-pressed:hover:bg-transparent data-pressed:hover:text-accent-strong",
      },
      size: {
        default: "h-8 min-w-8 px-2",
        xs: "h-5 min-w-0 px-2.5 py-0.5 text-2xs",
        sm: "h-7 min-w-7 px-1.5",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
