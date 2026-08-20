"use client";

import { ApiError } from "@/lib/api/api-error";
import { CartInitialDataProvider } from "@/features/cart/components/cart-initial-data-provider";
import type { Cart } from "@/features/cart/types/cart";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
  initialCart: Cart | undefined;
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

export default function Providers({ children, initialCart }: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <QueryClientProvider client={queryClient}>
        <CartInitialDataProvider cart={initialCart}>
          <NuqsAdapter>
            {children}
            <Toaster />
          </NuqsAdapter>
        </CartInitialDataProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
