import { createParser } from "nuqs/server";

export const GUEST_CHECKOUT_STEPS = ["contact", "shipping", "review"] as const;
export type GuestCheckoutStep = (typeof GUEST_CHECKOUT_STEPS)[number];

const parseAsGuestCheckoutStep = createParser<GuestCheckoutStep>({
  parse(value) {
    return (GUEST_CHECKOUT_STEPS as readonly string[]).includes(value)
      ? (value as GuestCheckoutStep)
      : null;
  },
  serialize(value) {
    return value;
  },
}).withDefault("contact");

export const checkoutParamsParsers = {
  step: parseAsGuestCheckoutStep,
};
