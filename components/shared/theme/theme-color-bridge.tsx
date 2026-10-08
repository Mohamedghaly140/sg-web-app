"use client";

import { useEffect, useState } from "react";

function readPaintedBackground() {
  /* `body { @apply bg-background }` in `@layer base`, so the painted body
     background *is* `--background` resolved. Reading it rather than writing a
     hex literal here keeps `app/globals.css` the single source of truth --
     `01-conventions.md` 7 forbids restating a token's value in code -- and
     means Phase 14.2's palette flows through with no edit to this file. */
  return getComputedStyle(document.body).backgroundColor;
}

/**
 * Keeps `<meta name="theme-color">` in step with the active theme so the mobile
 * browser chrome follows the page instead of staying light.
 *
 * A `viewport.themeColor` export is deliberately not used: a
 * `prefers-color-scheme` media pair would follow the OS rather than the
 * customer's explicit choice, and it would have to restate the palette's hex.
 */
export function ThemeColorBridge() {
  const [themeColor, setThemeColor] = useState<string | null>(null);

  useEffect(() => {
    /* Observe the class rather than `useTheme()`: next-themes applies the
       `dark` class in the *provider's* effect, and React flushes child effects
       before parent effects -- a descendant keyed on `resolvedTheme` would read
       the previous background and land one toggle behind. */
    const root = document.documentElement;
    const sync = () => setThemeColor(readPaintedBackground());

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  /* React 19 hoists this into <head>; no imperative DOM lifecycle needed. */
  return themeColor ? <meta name="theme-color" content={themeColor} /> : null;
}
