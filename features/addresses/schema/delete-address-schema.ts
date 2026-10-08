import { z } from "zod";

export const deleteAddressSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();
