"use client";

import { Show, SignInButton } from "@clerk/nextjs";

/* The guest flow's own sign-in affordance (Phase 13 §13.4).
   The header's context line is the only other one and it is hidden below `md`,
   so without this a returning customer on a phone had no way to sign in from
   checkout at all.

   It returns to `/checkout`, not `/checkout/guest`: signing in performs the
   implicit cart merge and deletes `sg_cart_session`, and continuing through the
   guest wizard would then push a merged user cart at `POST /orders/guest` and
   throw away the saved addresses the customer signed in to use. */
export function GuestSignInRow() {
  return (
    <Show when="signed-out">
      <p className="text-xs text-muted-foreground">
        Have an account?{" "}
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
          <button
            type="button"
            className="text-accent-strong underline underline-offset-3"
          >
            Sign in
          </button>
        </SignInButton>{" "}
        to use your saved addresses.
      </p>
    </Show>
  );
}
