"use client";

import { Show, SignInButton } from "@clerk/nextjs";
import { cloneElement, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface RequireAuthProps {
  trigger: ReactElement;
  title?: string;
  description?: string;
  signInLabel?: string;
  cancelLabel?: string;
}

type RequireAuthTriggerProps = {
  onClick?: unknown;
  href?: unknown;
};

export function RequireAuth({
  trigger,
  title = "Sign in to continue",
  description,
  signInLabel = "Sign in",
  cancelLabel = "Not now",
}: RequireAuthProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const returnUrl =
    typeof window !== "undefined" ? pathname + window.location.search : pathname;

  return (
    <>
      <Show when="signed-in">{trigger}</Show>
      <Show when="signed-out">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger
            render={cloneElement(
              trigger as ReactElement<RequireAuthTriggerProps>,
              {
                onClick: undefined,
                href: undefined,
              },
            )}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              ) : null}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
              <SignInButton mode="modal" fallbackRedirectUrl={returnUrl}>
                <AlertDialogAction onClick={() => setOpen(false)}>
                  {signInLabel}
                </AlertDialogAction>
              </SignInButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Show>
    </>
  );
}
