"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import { useSyncCart } from "@/features/cart/hooks/use-sync-cart";

export function CartMergeBridge() {
  const { isLoaded, sessionId } = useAuth();
  const syncedSessionId = useRef<string | null>(null);
  const { mutate } = useSyncCart({
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
