"use client";

import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function HeaderAuthControls() {
  const pathname = usePathname();
  const returnUrl =
    typeof window !== "undefined" ? pathname + window.location.search : pathname;

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal" fallbackRedirectUrl={returnUrl}>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl={returnUrl}>
          <Button variant="ghost" size="sm">
            Sign up
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
        <SignOutButton>
          <Button variant="outline" size="sm">
            Sign out
          </Button>
        </SignOutButton>
      </Show>
    </>
  );
}
