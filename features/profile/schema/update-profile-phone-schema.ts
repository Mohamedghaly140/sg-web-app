import { z } from "zod";

export const updateProfilePhoneSchema = z
  .object({
    phone: z.string().trim().min(1),
  })
  .strict();

export type UpdateProfilePhoneInput = z.infer<typeof updateProfilePhoneSchema>;
