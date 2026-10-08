import { z } from "zod";

export const cancelOrderSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();
