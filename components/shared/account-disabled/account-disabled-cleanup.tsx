"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAccountDisabledSignOut } from "@/components/shared/account-disabled/use-account-disabled-sign-out";

export function AccountDisabledCleanup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signOut = useAccountDisabledSignOut();
  const handledRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("reason") !== "account-disabled") {
      return;
    }
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    void (async () => {
      await signOut();
      router.replace("/account-disabled");
    })();
  }, [searchParams, signOut, router]);

  return null;
}
