"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkBaseClassName =
  "flex items-center py-2 pl-[11px] text-sm text-foreground hover:text-accent-strong";
const linkActiveClassName =
  "border-l border-primary text-accent-strong pl-[10px]";

export function AccountSubNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex w-[210px] shrink-0 flex-col gap-1">
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        YOUR ACCOUNT
      </span>

      <Link
        href="/account"
        className={`${linkBaseClassName}${pathname === "/account" ? ` ${linkActiveClassName}` : ""}`}
      >
        Overview
      </Link>

      <Link
        href="/account/orders"
        className={`${linkBaseClassName}${pathname?.startsWith("/account/orders") ? ` ${linkActiveClassName}` : ""}`}
      >
        Orders
      </Link>

      <Link
        href="/account/addresses"
        className={`${linkBaseClassName}${pathname?.startsWith("/account/addresses") ? ` ${linkActiveClassName}` : ""}`}
      >
        Addresses
      </Link>

      <Link
        href="/account/wishlist"
        className={`${linkBaseClassName}${pathname?.startsWith("/account/wishlist") ? ` ${linkActiveClassName}` : ""}`}
      >
        Wishlist
      </Link>

      <span className="flex items-center py-2 pl-[11px] text-sm text-muted-foreground">
        Profile
      </span>
    </nav>
  );
}
