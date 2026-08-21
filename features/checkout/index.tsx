import { auth } from "@clerk/nextjs/server";

import { getAddresses } from "@/features/addresses/queries/get-addresses";
import { CheckoutSignInPrompt } from "@/features/checkout/components/checkout-sign-in-prompt";
import { RegisteredCheckoutContent } from "@/features/checkout/components/registered-checkout-content";

export default async function CheckoutFeature() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <CheckoutSignInPrompt />
      </div>
    );
  }

  const addresses = await getAddresses();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
        Checkout
      </h1>
      <RegisteredCheckoutContent addresses={addresses} />
    </div>
  );
}
