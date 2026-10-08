"use client";

import { AccountDisabledSignOut } from "@/components/shared/account-disabled/account-disabled-sign-out";
import { useCart } from "@/features/cart/hooks/use-cart";
import { ApiError } from "@/lib/api/api-error";

// Lives inside the providers so `useCart()` has a QueryClient above it.
export function AccountDisabledBridge() {
  const { error } = useCart();

  return (
    <AccountDisabledSignOut
      when={error instanceof ApiError && error.code === "ACCOUNT_DISABLED"}
    />
  );
}
