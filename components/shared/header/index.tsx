import Link from "next/link";
import { LucideHeart } from "lucide-react";

import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderMobileMenu } from "@/components/shared/header/header-mobile-menu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-foreground"
        >
          SG Couture
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form method="GET" action="/products" className="hidden flex-1 sm:flex">
          <input
            type="search"
            name="search"
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled
            aria-label="Wishlist"
            className="hidden sm:inline-flex"
          >
            <LucideHeart />
          </Button>
          <CartDrawer />
          <div className="hidden items-center gap-2 sm:flex">
            <HeaderAuthControls />
          </div>
          <HeaderMobileMenu navLinks={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
