import { createParser } from "nuqs/server";

export const GUEST_CHECKOUT_STEPS = ["contact", "shipping", "review"] as const;
export type GuestCheckoutStep = (typeof GUEST_CHECKOUT_STEPS)[number];

export const REGISTERED_CHECKOUT_STEPS = ["address", "payment", "review"] as const;
export type RegisteredCheckoutStep = (typeof REGISTERED_CHECKOUT_STEPS)[number];

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

const parseAsRegisteredCheckoutStep = createParser<RegisteredCheckoutStep>({
  parse(value) {
    return (REGISTERED_CHECKOUT_STEPS as readonly string[]).includes(value)
      ? (value as RegisteredCheckoutStep)
      : null;
  },
  serialize(value) {
    return value;
  },
}).withDefault("address");

export const guestCheckoutParamsParsers = {
  step: parseAsGuestCheckoutStep,
};

export const registeredCheckoutParamsParsers = {
  step: parseAsRegisteredCheckoutStep,
};
