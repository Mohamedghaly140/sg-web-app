"use client";

import { catchError } from "next/error";

/**
 * Renders nothing when the subtree beneath it throws.
 *
 * For inline, non-essential detail that must never take the page down with it —
 * a count beside a heading, a shipping estimate, a review teaser. A missing
 * value is a better outcome than an error card in a spot too small to hold one,
 * and far better than a crashed route.
 *
 * Do NOT use it for a surface the shopper came for. Those get
 * `SectionErrorBoundary`, which says something went wrong instead of quietly
 * hiding it.
 */
export const HideOnError = catchError(() => null);
