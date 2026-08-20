"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback, useRef } from "react";

export function useAccountDisabledSignOut() {
  const { signOut } = useClerk();
  const handledRef = useRef(false);

  return useCallback(async () => {
    if (handledRef.current) return;
    handledRef.current = true;
    await signOut();
  }, [signOut]);
}
