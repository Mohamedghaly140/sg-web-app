import { HideOnError } from "@/components/shared/hide-on-error";

/* The count shares its promise with the results grid. When that fetch fails the
   grid already shows SectionErrorBoundary's "unavailable right now" card, so
   this inline count must fail silently rather than raise a second, redundant
   error surface -- or, without a boundary of its own, crash the whole page.

   The Filter trigger and the applied-filter tags sit outside every boundary on
   purpose: they derive from the URL alone, so filtering stays usable even when
   the catalogue request is failing. */
export const ProductsCountBoundary = HideOnError;
