import { z } from "zod";

export const updateProfileNameSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
  })
  .strict();

export type UpdateProfileNameInput = z.infer<typeof updateProfileNameSchema>;
