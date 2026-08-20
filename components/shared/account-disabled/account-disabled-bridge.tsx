"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAccountDisabledSignOut } from "@/components/shared/account-disabled/use-account-disabled-sign-out";
import { useCart } from "@/features/cart/hooks/use-cart";
import { ApiError } from "@/lib/api/api-error";

export function AccountDisabledBridge() {
  const { error } = useCart();
  const router = useRouter();
  const signOut = useAccountDisabledSignOut();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!error) {
      handledRef.current = false;
      return;
    }

    if (!(error instanceof ApiError && error.code === "ACCOUNT_DISABLED")) {
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
  }, [error, signOut, router]);

  return null;
}
