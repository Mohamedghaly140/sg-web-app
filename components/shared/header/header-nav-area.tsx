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
    if (isSignedIn) {
      return (
        <span className="text-eyebrow text-muted-foreground">
          Secure checkout · signed in as {user?.firstName ?? "you"}
        </span>
      );
    }

    return (
      <span className="text-eyebrow text-muted-foreground">
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
