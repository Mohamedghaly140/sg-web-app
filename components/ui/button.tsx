import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding text-sm font-heading font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary text-accent-strong bg-transparent hover:bg-primary/12 active:bg-primary/22",
        outline:
          "border-border bg-transparent hover:bg-secondary active:bg-foreground/14",
        secondary:
          "border-border bg-transparent hover:bg-secondary active:bg-foreground/14",
        ghost: "text-accent-strong hover:bg-primary/10",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:outline-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-accent-strong underline-offset-3 hover:underline",
      },
      /* Touch targets (Phase 13.6, docs/phase-13-responsive.md §13.6). The
         designed control height is `h-8` -- 36.8px against this app's
         `--spacing: 0.2875rem` -- which is below the 44px coarse-pointer
         guidance. `pointer-coarse:` is Tailwind's own built-in variant
         (`@media (pointer: coarse)`); do not register a custom one.
         `min-h-*`/`min-w-*` rather than `h-*`/`size-*` deliberately: a
         `pointer-coarse:h-10` sorts after a plain `h-auto` and would win inside
         the media query, clipping the deliberate `h-auto` sites
         (features/contact/components/contact-form.tsx:232,244 and
         features/products/components/products-sort.tsx). `min-h-10` is 46px --
         `min-h-9` is 41.4px and misses the target.
         `lg`/`icon-lg` already clear 44px. `variant: "link"` is intentionally
         untouched: it sets inline in a paragraph and a height floor would break
         the line box. */
      size: {
        default:
          "h-8 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 pointer-coarse:min-h-10",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 pointer-coarse:min-h-10",
        sm: "h-7 gap-1 rounded-sm px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 pointer-coarse:min-h-10",
        lg: "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8 pointer-coarse:min-h-10 pointer-coarse:min-w-10",
        "icon-xs":
          "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3 pointer-coarse:min-h-10 pointer-coarse:min-w-10",
        "icon-sm":
          "size-7 rounded-sm pointer-coarse:min-h-10 pointer-coarse:min-w-10",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
