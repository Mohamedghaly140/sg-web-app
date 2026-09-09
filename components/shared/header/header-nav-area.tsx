"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { HeaderCategoriesMenu } from "@/components/shared/header/header-categories-menu";
import { SearchField } from "@/components/shared/search-field";
import type { Category } from "@/features/categories/types/category";

type HeaderNavAreaProps = {
  categories: Category[];
};

export function HeaderNavArea({ categories }: HeaderNavAreaProps) {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  if (pathname?.startsWith("/account")) {
    return (
      <span className="text-eyebrow text-foreground">
        {user?.firstName ?? "Account"}
      </span>
    );
  }

  if (pathname?.startsWith("/checkout")) {
    /* The context line is a flex item in the header's nowrap row and had no
       `min-w-0`, so it refused to shrink and pushed the page past the viewport
       — measured at 391px against 360px on /checkout/guest.
       `min-w-0 truncate` alone is not enough: the row's other children leave
       only 9.4px at 360px, 63px at 414px and 112px at 640px, against the
       131px this line needs for the words "Secure checkout" by themselves.
       Every narrow width therefore truncates to an unreadable stub, so the
       line is hidden until `md`, where 240px is finally available. The full
       string including the sign-in link needs 335px and fits from `lg`.
       Consequence recorded against §13.4: the header is the only sign-in
       affordance on guest checkout, so below `md` there is now none. */
    if (isSignedIn) {
      return (
        <span className="text-eyebrow hidden min-w-0 truncate text-muted-foreground md:inline">
          Secure checkout · signed in as {user?.firstName ?? "you"}
        </span>
      );
    }

    return (
      <span className="text-eyebrow hidden min-w-0 truncate text-muted-foreground md:inline">
        Secure checkout ·{" "}
        <Link
          href="/sign-in"
          className="text-accent-strong underline underline-offset-3"
        >
          Have an account? Sign in
        </Link>
      </span>
    );
  }

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
        <Link
          href="/products?sort=newest"
          className="text-eyebrow text-foreground hover:text-accent"
        >
          New In
        </Link>
        <HeaderCategoriesMenu categories={categories} />
      </nav>

      <form method="GET" action="/products" className="hidden flex-1 sm:flex">
        <SearchField className="w-full max-w-[230px]" />
      </form>
    </>
  );
}
