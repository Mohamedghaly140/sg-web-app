"use client";

import { usePathname } from "next/navigation";

/* The header's three context variants (Phase 8 §8.8). Phase 8 specified them as
   a `variant` prop "resolved by route segment"; the shipped code resolved them
   with `usePathname()` inside `HeaderNavArea` instead, and 13.4 gave them a
   third and fourth consumer (the mobile menu and the expanding search, both of
   which are suppressed on checkout). The matching lives here once rather than
   as `startsWith` branches copied across components.

   `Header` is a Server Component and cannot know the pathname, so the gate is
   necessarily client-side; do not reach for `headers()` to move it. */
export type HeaderVariant = "storefront" | "account" | "checkout";

export function resolveHeaderVariant(pathname: string | null): HeaderVariant {
  if (pathname?.startsWith("/account")) return "account";
  if (pathname?.startsWith("/checkout")) return "checkout";

  return "storefront";
}

export function useHeaderVariant(): HeaderVariant {
  return resolveHeaderVariant(usePathname());
}
