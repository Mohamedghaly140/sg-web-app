"use client";

import { AccountDisabledBridge } from "@/components/shared/account-disabled/account-disabled-bridge";
import { AppToaster } from "@/components/shared/toaster";
import { ThemeColorBridge } from "@/components/shared/theme/theme-color-bridge";
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
import { ThemeProvider } from "next-themes";
import { useState } from "react";

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
    /* Outermost on purpose: Clerk's `shadcn` appearance and sonner both resolve
       against the active theme, so the `dark` class has to be settled before
       either mounts. */
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProvider
        appearance={{
          theme: shadcn,
          variables: {
            fontFamily: "var(--font-lora)",
            fontFamilyButtons: "var(--font-lora)",
            borderRadius: "var(--radius-md)",
          },
          elements: {
            /* Clerk injects its own styles at runtime *unlayered*, and unlayered
               CSS always wins over anything in an `@layer` — so plain utilities
               here are applied to the element but lose the cascade. The trailing
               `!` is what actually lands the Classical heading treatment. */
            headerTitle:
              "font-heading! text-2xl! font-normal! text-foreground!",
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeColorBridge />
          <CartMergeBridge />
          <CartSignOutBridge />
          <CartInitialDataProvider cart={initialCart}>
            <WishlistInitialDataProvider initialWishlist={initialWishlist}>
              <AccountDisabledBridge />
              <NuqsAdapter>
                {children}
                <AppToaster />
              </NuqsAdapter>
            </WishlistInitialDataProvider>
          </CartInitialDataProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
