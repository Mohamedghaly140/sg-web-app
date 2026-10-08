"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type AccountDisabledSignOutProps = {
  when: boolean;
};

export function AccountDisabledSignOut({ when }: AccountDisabledSignOutProps) {
  const { signOut } = useClerk();
  const { sessionId } = useAuth();
  const router = useRouter();
  // Once per Clerk session: sign-out flips `sessionId` to null, which re-runs
  // this effect, and a new session re-arms the guard.
  const handledSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!when || !sessionId || handledSessionIdRef.current === sessionId) {
      return;
    }
    handledSessionIdRef.current = sessionId;

    void (async () => {
      try {
        await signOut();
      } catch {
        // Reset so a later disabled detection can retry; still land on the
        // disabled page rather than leaving the user stranded.
        handledSessionIdRef.current = null;
      }
      router.replace("/account-disabled");
    })();
  }, [when, sessionId, signOut, router]);

  return null;
}
