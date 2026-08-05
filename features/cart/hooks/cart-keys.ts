/**
 * Query keys for the single authoritative cart cache entry.
 *
 * No `"use client"` directive: server-safe so cookie-write-capable and RSC
 * modules can reference the same keys without pulling in a client boundary.
 */
export const cartKeys = {
  all: ["cart"] as const,
  current: ["cart", "current"] as const,
};
