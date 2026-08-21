import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CheckoutSignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Sign in to check out faster
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Sign in to use your saved addresses, or continue without an account.
      </p>
      <div className="flex gap-2">
        <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
          <Button type="button">Sign in</Button>
        </SignInButton>
        <Button variant="outline" render={<Link href="/checkout/guest" />} nativeButton={false}>
          Continue as guest
        </Button>
      </div>
    </div>
  );
}
