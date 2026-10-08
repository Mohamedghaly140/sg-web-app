import Link from "next/link";

import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { getCategories } from "@/features/categories/queries/get-categories";
import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderNavArea } from "@/components/shared/header/header-nav-area";
import { HeaderSearch } from "@/components/shared/header/header-search";
import { HeaderThemeToggle } from "@/components/shared/header/header-theme-toggle";
import { HeaderWishlistLink } from "@/components/shared/header/header-wishlist-link";
import { Sidenav } from "@/components/shared/sidenav/sidenav";

export async function Header() {
  const categories = await getCategories();

  return (
    /* `relative` anchors the narrow-width search panel (`header-search.tsx`),
       which drops out of the flow at `top-full` so the header keeps a constant
       65px height at every viewport. */
    <header className="relative border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/">
          <span className="font-heading text-[22px] tracking-[0.04em]">
            SG<span className="text-accent-strong">·</span>COUTURE
          </span>
        </Link>

        <HeaderNavArea categories={categories} />

        <div className="ml-auto flex items-center gap-1">
          <HeaderWishlistLink />
          <HeaderSearch />
          <CartDrawer />
          <div className="hidden items-center gap-2 lg:flex">
            <HeaderAuthControls />
          </div>
          {/* Deliberately not gated on `useHeaderVariant`: Sidenav and
              HeaderSearch null out on checkout because they are navigation-away
              chrome, and a preference control is not. */}
          <HeaderThemeToggle />
          <Sidenav categories={categories} />
        </div>
      </div>
    </header>
  );
}
