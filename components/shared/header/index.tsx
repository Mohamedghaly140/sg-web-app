import Link from "next/link";

import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { getCategories } from "@/features/categories/queries/get-categories";
import { HeaderAuthControls } from "@/components/shared/header/header-auth-controls";
import { HeaderNavArea } from "@/components/shared/header/header-nav-area";
import { HeaderWishlistLink } from "@/components/shared/header/header-wishlist-link";
import { Sidenav } from "@/components/shared/sidenav/sidenav";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/">
          <span className="font-heading text-[22px] tracking-[0.04em]">
            SG<span className="text-accent-strong">·</span>COUTURE
          </span>
        </Link>

        <HeaderNavArea categories={categories} />

        <div className="ml-auto flex items-center gap-1">
          <HeaderWishlistLink />
          <CartDrawer />
          <div className="hidden items-center gap-2 sm:flex">
            <HeaderAuthControls />
          </div>
          <Sidenav categories={categories} />
        </div>
      </div>
    </header>
  );
}
