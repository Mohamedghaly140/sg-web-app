"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/* sonner ships its own light/dark stylesheet keyed on
   `[data-sonner-toaster][data-theme]`, and the `theme` prop defaults to
   `"light"`. Its own `"system"` value reads `prefers-color-scheme`, so it
   cannot honour an explicit customer choice -- the value has to come from
   next-themes. That is why this lives in its own client component rather than
   inline in `app/providers.tsx`: it must be a *descendant* of `ThemeProvider`
   to read the context. */
export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        /* The trailing `!` is load-bearing, for the same reason it is on
           Clerk's `headerTitle` in `app/providers.tsx`: sonner injects its own
           stylesheet at runtime *unlayered*, and unlayered CSS beats anything
           in `@layer utilities` regardless of specificity. Without it these
           utilities are applied to the element but lose the cascade, and the
           toast renders sonner's own white-on-black rather than the Classical
           surface -- in both themes. */
        classNames: {
          toast:
            "bg-popover! text-popover-foreground! border! border-border! shadow-none!",
          title: "text-foreground! font-heading!",
          description: "text-muted-foreground!",
          actionButton:
            "bg-transparent! text-accent-strong! border! border-primary! font-heading!",
          cancelButton:
            "bg-transparent! text-muted-foreground! border! border-border!",
        },
      }}
    />
  );
}
