"use client";

import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import {
  LucideLogIn,
  LucideMapPin,
  LucideUser,
  LucideUserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeaderAuthControls() {
  const pathname = usePathname();
  const returnUrl =
    typeof window !== "undefined"
      ? pathname + window.location.search
      : pathname;

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal" fallbackRedirectUrl={returnUrl}>
          <Button variant="outline" size="sm">
            <LucideLogIn data-icon="inline-start" />
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal" fallbackRedirectUrl={returnUrl}>
          <Button variant="ghost" size="sm">
            <LucideUserPlus data-icon="inline-start" />
            Sign up
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Account"
              labelIcon={<LucideUser size={16} />}
              href="/account"
            />
            <UserButton.Link
              label="Addresses"
              labelIcon={<LucideMapPin size={16} />}
              href="/account/addresses"
            />
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </>
  );
}
