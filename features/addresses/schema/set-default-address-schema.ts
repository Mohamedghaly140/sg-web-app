import { z } from "zod";

export const setDefaultAddressSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();
