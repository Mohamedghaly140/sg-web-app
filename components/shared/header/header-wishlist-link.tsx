"use client";

import { LucideHeart } from "lucide-react";
import { useRouter } from "next/navigation";

import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import { Button } from "@/components/ui/button";

type HeaderWishlistLinkProps = {
  variant?: "icon" | "nav";
  onNavigate?: () => void;
};

export function HeaderWishlistLink({
  variant = "icon",
  onNavigate,
}: HeaderWishlistLinkProps) {
  const router = useRouter();

  function handleClick() {
    router.push("/account/wishlist");
    onNavigate?.();
  }

  if (variant === "nav") {
    return (
      <RequireAuth
        title="Sign in to view your wishlist"
        trigger={
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 px-0 text-eyebrow text-foreground hover:bg-transparent"
            onClick={handleClick}
          >
            <LucideHeart className="size-4" />
            Wishlist
          </Button>
        }
      />
    );
  }

  return (
    <RequireAuth
      title="Sign in to view your wishlist"
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Wishlist"
          className="hidden sm:inline-flex"
          onClick={handleClick}
        >
          <LucideHeart />
        </Button>
      }
    />
  );
}
