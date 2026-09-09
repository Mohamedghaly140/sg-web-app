"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LucideSearch, LucideX } from "lucide-react";

import { SearchField } from "@/components/shared/search-field";
import { useHeaderVariant } from "@/components/shared/header/use-header-variant";
import { Button } from "@/components/ui/button";

const PANEL_ID = "header-search-panel";

/* The narrow-width half of the header's search (Phase 13 §13.4). Below `lg` the
   persistent 230px field is an icon that expands; from `lg` the inline form in
   `header-nav-area.tsx` takes over. Both render the same shared `SearchField`,
   so the two can never drift.

   The expanded field is absolutely positioned at the header's `top-full`, not a
   wrapped flex line: it must not compete for width inside the nowrap row this
   task exists to unbreak, and dropping it out of the flow keeps the header's
   height constant at 65px whether it is open or closed. Both halves stay in one
   client component, so the disclosure state never has to be lifted into the
   `Header` RSC. */
export function HeaderSearch() {
  const variant = useHeaderVariant();
  const pathname = usePathname();

  /* Openness is derived, not synchronised: the panel remembers the route it was
     opened on, so any navigation closes it without an effect calling setState.
     A submit from /products keeps the same pathname, so the form closes itself
     on submit as well. */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn !== null && openedOn === pathname;
  const close = () => setOpenedOn(null);

  if (variant === "checkout") {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isOpen ? "Close search" : "Search"}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        className="lg:hidden"
        onClick={() => setOpenedOn(isOpen ? null : pathname)}
      >
        {isOpen ? <LucideX /> : <LucideSearch />}
      </Button>

      {isOpen ? (
        <form
          id={PANEL_ID}
          method="GET"
          action="/products"
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-background px-4 py-3 shadow-lg sm:px-6 lg:hidden"
          onSubmit={close}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              close();
            }
          }}
        >
          <SearchField className="w-full" autoFocus />
        </form>
      ) : null}
    </>
  );
}
