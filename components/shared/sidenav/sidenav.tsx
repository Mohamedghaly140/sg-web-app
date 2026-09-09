"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideMenu } from "lucide-react";

import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderWishlistLink } from "@/components/shared/header/header-wishlist-link";
import { useHeaderVariant } from "@/components/shared/header/use-header-variant";
import type { Category } from "@/features/categories/types/category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SidenavProps = {
  categories: Category[];
};

export function Sidenav({ categories }: SidenavProps) {
  const variant = useHeaderVariant();
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  /* Checkout is a focus flow: a catalogue menu inside it is a leak, not a
     feature. This removes chrome, never a route — the wordmark still links to
     `/` — so the guest-first, no-hard-redirect stance is untouched. Account
     keeps the menu: the desktop account header drops nav and search by design
     (the handoff's "Account screens replace nav+search with the customer
     name"), and without this a phone would have no navigation at all. */
  if (variant === "checkout") {
    return null;
  }

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open menu" />
          }
        >
          <LucideMenu />
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-4">
            <nav aria-label="Main" className="flex flex-col gap-4">
              <Link
                href="/products?sort=newest"
                onClick={close}
                className="text-eyebrow text-foreground"
              >
                New In
              </Link>
              <HeaderWishlistLink variant="nav" onNavigate={close} />
            </nav>

            <div className="flex flex-col gap-3">
              <Link
                href="/categories"
                onClick={close}
                className="text-eyebrow text-foreground"
              >
                All categories
              </Link>

              <Accordion multiple className="w-full">
                {categories.map((category) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/categories/${category.slug}`}
                        onClick={close}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-accent"
                      >
                        {category.name}
                      </Link>
                      {category.subCategories.length > 0 ? (
                        <AccordionTrigger
                          aria-label={`Expand ${category.name}`}
                          className="flex-none px-2 hover:no-underline"
                        />
                      ) : null}
                    </div>
                    {category.subCategories.length > 0 ? (
                      <AccordionContent className="flex flex-col gap-2 ps-4 [&_a]:no-underline">
                        {category.subCategories.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={`/categories/${subCategory.slug}`}
                            onClick={close}
                            className="text-sm text-muted-foreground hover:text-accent"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    ) : null}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="flex items-center gap-2">
              <HeaderAuthControls />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
