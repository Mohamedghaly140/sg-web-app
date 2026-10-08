"use client";

import { LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function HeaderThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* The icon swap is done in CSS, not with a `mounted` state guard:
          next-themes writes the `dark` class before hydration, so the correct
          icon is already painted on first frame and there is no mismatch to
          suppress. `resolvedTheme` is only read inside the click handler,
          which cannot fire before hydration. */}
      <LucideSun className="dark:hidden" />
      <LucideMoon className="hidden dark:block" />
    </Button>
  );
}
