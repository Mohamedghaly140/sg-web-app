import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

/**
 * Best-effort client UX check aligned with the backend's `@IsPhoneNumber('EG')`
 * (libphonenumber-js). Backend VALIDATION_ERROR on `phone` remains authoritative.
 */
export const egyptPhoneSchema = z
  .string()
  .trim()
  .refine((value) => isValidPhoneNumber(value, "EG"), {
    message: "Enter a valid Egyptian phone number",
  });
