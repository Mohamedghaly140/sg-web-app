"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/account", label: "Overview", match: "exact" },
  { href: "/account/orders", label: "Orders", match: "prefix" },
  { href: "/account/addresses", label: "Addresses", match: "prefix" },
  { href: "/account/wishlist", label: "Wishlist", match: "prefix" },
  { href: "/account/profile", label: "Profile", match: "prefix" },
] as const;

const linkBaseClassName =
  "flex items-center whitespace-nowrap py-2 pb-[11px] text-sm text-foreground hover:text-accent-strong lg:pb-2 lg:pl-[11px]";
const linkActiveClassName =
  "border-b border-primary pb-[10px] text-accent-strong lg:border-b-0 lg:border-l lg:pb-2 lg:pl-[10px]";

function isNavItemActive(
  pathname: string | null,
  href: (typeof NAV_ITEMS)[number]["href"],
  match: (typeof NAV_ITEMS)[number]["match"],
): boolean {
  if (match === "exact") {
    return pathname === href;
  }

  return Boolean(pathname?.startsWith(href));
}

export function AccountSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      /* `overflow-x-auto` also makes overflow-y compute to `auto`, so the tab
         row is a clipping scroll container below `lg`. The global focus ring
         (`app/globals.css`) is a 2px outline at a 2px offset drawn *outside*
         the link box, so with no room inside the scroll box it is clipped on
         every item's top and bottom edge and on the outer edge of the first
         and last. The 4.6px inset gives it room; the matching negative margin
         keeps the first tab flush with the content column below it, and is
         absorbed by the layout's own px-4. Both are dropped at `lg`, where the
         nav is `overflow-visible` and nothing clips. */
      className="-m-1 flex w-full gap-1 overflow-x-auto p-1 lg:m-0 lg:w-[210px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:p-0"
    >
      <span className="hidden text-[11px] tracking-[0.14em] text-muted-foreground uppercase lg:block">
        YOUR ACCOUNT
      </span>

      {NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href, item.match);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${linkBaseClassName}${isActive ? ` ${linkActiveClassName}` : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
