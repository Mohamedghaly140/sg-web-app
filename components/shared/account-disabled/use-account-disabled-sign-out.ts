"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useCallback, useRef } from "react";

export function useAccountDisabledSignOut() {
  const { signOut } = useClerk();
  const { sessionId } = useAuth();
  const handledSessionIdRef = useRef<string | null>(null);

  return useCallback(async () => {
    if (handledSessionIdRef.current === sessionId) {
      return;
    }
    handledSessionIdRef.current = sessionId ?? null;

    try {
      await signOut();
    } catch (error) {
      handledSessionIdRef.current = null;
      throw error;
    }
  }, [signOut, sessionId]);
}
