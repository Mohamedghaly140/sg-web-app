"use client";

import { useState } from "react";
import Link from "next/link";
import { LucideMenu, LucideSearch } from "lucide-react";
import { Show, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type HeaderMobileMenuProps = {
  navLinks: { href: string; label: string }[];
};

export function HeaderMobileMenu({ navLinks }: HeaderMobileMenuProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 sm:hidden">
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" aria-label="Search" />}
        >
          <LucideSearch />
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form action="/products" method="GET" className="px-4 pb-4">
            <input
              type="search"
              name="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open menu" />
          }
        >
          <LucideMenu />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Main" className="flex flex-col gap-4 px-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsNavOpen(false)}
                className="text-sm font-medium text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
                <SignOutButton>
                  <Button variant="outline" size="sm">
                    Sign out
                  </Button>
                </SignOutButton>
              </Show>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
