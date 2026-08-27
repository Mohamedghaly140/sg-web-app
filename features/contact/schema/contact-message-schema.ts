import { z } from "zod";

import { optionalBlankToUndefined } from "@/features/addresses/schema/address-field-schema";
import { egyptPhoneSchema } from "@/lib/constants/egypt-phone";

// These are provisional UI labels, not confirmed API wire values. Revisit
// docs/backend-contract-gaps.md GAP-5 when a real POST /contact lands.
export const contactMessageTopics = [
  "A piece I want",
  "Sizing & fit",
  "Alterations",
  "Delivery",
  "Returns",
  "Something else",
] as const;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  // Deliberately Egypt-only, consistent with the rest of the storefront.
  phone: z.preprocess(
    optionalBlankToUndefined,
    egyptPhoneSchema.optional(),
  ),
  email: z.email().trim().toLowerCase(),
  topic: z.enum(contactMessageTopics, { error: "Choose a topic" }),
  message: z
    .string()
    .trim()
    .min(10, "Enter at least 10 characters"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
