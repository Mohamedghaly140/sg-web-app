import { GuestCheckoutWizard } from "@/features/checkout-guest/components/guest-checkout-wizard";

export default function CheckoutGuestFeature() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-display-2 text-foreground">
        Guest checkout
      </h1>
      <GuestCheckoutWizard />
    </div>
  );
}
