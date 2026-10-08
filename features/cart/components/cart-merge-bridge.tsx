"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import { syncCartAction } from "@/features/cart/actions/sync-cart";
import { useCartMutation } from "@/features/cart/hooks/use-cart-mutation";

export function CartMergeBridge() {
  const { isLoaded, sessionId } = useAuth();
  const syncedSessionId = useRef<string | null>(null);
  const { mutate } = useCartMutation<void>(syncCartAction, {
    onSuccess: (result) => {
      if ("error" in result) {
        syncedSessionId.current = null;
      }
    },
  });

  useEffect(() => {
    if (!isLoaded || !sessionId || syncedSessionId.current === sessionId) {
      return;
    }
    syncedSessionId.current = sessionId;
    mutate();
  }, [isLoaded, sessionId, mutate]);

  return null;
}
