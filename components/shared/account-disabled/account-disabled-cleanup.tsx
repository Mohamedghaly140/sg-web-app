"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAccountDisabledSignOut } from "@/components/shared/account-disabled/use-account-disabled-sign-out";

type AccountDisabledCleanupProps = {
  shouldSignOut: boolean;
};

export function AccountDisabledCleanup({
  shouldSignOut,
}: AccountDisabledCleanupProps) {
  const router = useRouter();
  const signOut = useAccountDisabledSignOut();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!shouldSignOut || handledRef.current) {
      return;
    }
    handledRef.current = true;

    void (async () => {
      try {
        await signOut();
      } catch {
        // Still land on the plain URL below; the disabled state renders
        // regardless of whether Clerk sign-out itself succeeded.
      }
      router.replace("/account-disabled");
    })();
  }, [shouldSignOut, signOut, router]);

  return null;
}
