"use client";

import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";

import { HeaderCategoriesMenu } from "@/components/shared/header/header-categories-menu";
import { useHeaderVariant } from "@/components/shared/header/use-header-variant";
import { SearchField } from "@/components/shared/search-field";
import type { Category } from "@/features/categories/types/category";

type HeaderNavAreaProps = {
  categories: Category[];
};

export function HeaderNavArea({ categories }: HeaderNavAreaProps) {
  const variant = useHeaderVariant();
  const { user, isSignedIn } = useUser();

  if (variant === "account") {
    /* Same defect and same fix as the checkout context line below (§13.4), found
       on /account-disabled during §13.7's walk: this is a flex item in the
       header's nowrap row with no `min-w-0`, so it refused to shrink and pushed
       the document to 424px against a 360px viewport. The storefront variant
       does not overflow because its nav and search collapse to zero below `lg`;
       this line had no such rung, and it is the whole 64px.
       Hidden until `md` rather than truncated: the row's other children leave
       too little for a first name to read as anything but a stub, and the label
       is contextual chrome — the account area itself is already named by the
       page heading and the sub-nav. */
    return (
      <span className="text-eyebrow hidden min-w-0 truncate text-foreground md:inline">
        {user?.firstName ?? "Account"}
      </span>
    );
  }

  if (variant === "checkout") {
    /* The context line is a flex item in the header's nowrap row and had no
       `min-w-0`, so it refused to shrink and pushed the page past the viewport
       — measured at 391px against 360px on /checkout/guest.
       `min-w-0 truncate` alone is not enough: the row's other children leave
       only 9.4px at 360px, 63px at 414px and 112px at 640px, against the
       131px this line needs for the words "Secure checkout" by themselves.
       Every narrow width therefore truncates to an unreadable stub, so the
       line is hidden until `md`, where 240px is finally available. The full
       string including the sign-in link needs 335px and fits from `lg`.
       Below `md` the affordance lives in the guest wizard's Contact step
       instead (§13.4), so signing in no longer depends on header width. */
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
        {/* The same modal and the same destination as the guest wizard's row,
            so the md-lg band does not expose two sign-in behaviours on one
            screen. `/checkout` and not `/checkout/guest`: signing in merges the
            anonymous cart and deletes `sg_cart_session`, and the registered
            flow is what a returning customer asked for. */}
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
          <button
            type="button"
            className="text-accent-strong underline underline-offset-3"
          >
            Have an account? Sign in
          </button>
        </SignInButton>
      </span>
    );
  }

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
        <Link
          href="/products?sort=newest"
          className="text-eyebrow text-foreground hover:text-accent"
        >
          New In
        </Link>
        <HeaderCategoriesMenu categories={categories} />
      </nav>

      <form method="GET" action="/products" className="hidden flex-1 lg:flex">
        <SearchField className="w-full max-w-[230px]" />
      </form>
    </>
  );
}
