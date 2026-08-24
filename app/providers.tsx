"use client";

import { AccountDisabledBridge } from "@/components/shared/account-disabled/account-disabled-bridge";
import { ApiError } from "@/lib/api/api-error";
import { CartInitialDataProvider } from "@/features/cart/components/cart-initial-data-provider";
import { CartMergeBridge } from "@/features/cart/components/cart-merge-bridge";
import { CartSignOutBridge } from "@/features/cart/components/cart-sign-out-bridge";
import type { Cart } from "@/features/cart/types/cart";
import {
  WishlistInitialDataProvider,
  type WishlistInitialData,
} from "@/features/wishlist/components/wishlist-initial-data-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
  initialCart: Cart | undefined;
  initialWishlist: WishlistInitialData | undefined;
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          error instanceof ApiError && error.status >= 400 && error.status < 500
            ? false
            : failureCount < 2,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export default function Providers({
  children,
  initialCart,
  initialWishlist,
}: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <QueryClientProvider client={queryClient}>
        <CartMergeBridge />
        <CartSignOutBridge />
        <CartInitialDataProvider cart={initialCart}>
          <WishlistInitialDataProvider initialWishlist={initialWishlist}>
            <AccountDisabledBridge />
            <NuqsAdapter>
              {children}
              <Toaster
                toastOptions={{
                  classNames: {
                    toast:
                      "bg-popover text-popover-foreground border border-border shadow-none",
                    title: "text-foreground font-heading",
                    description: "text-muted-foreground",
                    actionButton:
                      "bg-transparent text-accent-strong border border-primary font-heading",
                    cancelButton:
                      "bg-transparent text-muted-foreground border border-border",
                  },
                }}
              />
            </NuqsAdapter>
          </WishlistInitialDataProvider>
        </CartInitialDataProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
