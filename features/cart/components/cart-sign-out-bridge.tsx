"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { fetchCurrentCart } from "@/features/cart/hooks/use-cart";

export function CartSignOutBridge() {
  const { isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      wasSignedIn.current = true;
      return;
    }

    if (!wasSignedIn.current) {
      return;
    }

    wasSignedIn.current = false;

    queryClient.clear();

    void fetchCurrentCart()
      .then((cart) => {
        queryClient.setQueryData(cartKeys.current, cart);
      })
      .catch(() => {
        // Leave the cache empty on a transient failure; do not retry.
      });
  }, [isLoaded, isSignedIn, queryClient]);

  return null;
}
