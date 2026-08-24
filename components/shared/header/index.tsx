import Image from "next/image";
import Link from "next/link";

import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { getCategories } from "@/features/categories/queries/get-categories";
import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderCategoriesMenu } from "@/components/shared/header/header-categories-menu";
import { HeaderWishlistLink } from "@/components/shared/header/header-wishlist-link";
import { Sidenav } from "@/components/shared/sidenav/sidenav";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/">
          <Image
            src="/brand/logo-mark.png"
            alt="Safa Ghaly"
            width={318}
            height={242}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-eyebrow text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <HeaderCategoriesMenu categories={categories} />
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
          <HeaderWishlistLink />
          <CartDrawer />
          <div className="hidden items-center gap-2 sm:flex">
            <HeaderAuthControls />
          </div>
          <Sidenav navLinks={NAV_LINKS} categories={categories} />
        </div>
      </div>
    </header>
  );
}
