"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideMenu } from "lucide-react";

import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderWishlistLink } from "@/components/shared/header/header-wishlist-link";
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
  navLinks: { href: string; label: string }[];
  categories: Category[];
};

export function Sidenav({ navLinks, categories }: SidenavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <div className="sm:hidden">
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
            <form action="/products" method="GET">
              <input
                type="search"
                name="search"
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </form>

            <nav aria-label="Main" className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="text-eyebrow text-foreground"
                >
                  {link.label}
                </Link>
              ))}
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
