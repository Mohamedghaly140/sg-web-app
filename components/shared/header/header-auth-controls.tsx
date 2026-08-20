"use client";

import { usePathname } from "next/navigation";
import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { LucideLogIn } from "lucide-react";

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
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
