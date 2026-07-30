import { z } from "zod";

export const removeCartItemSchema = z
  .object({
    itemId: z.string().min(1),
  })
  .strict();

export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
