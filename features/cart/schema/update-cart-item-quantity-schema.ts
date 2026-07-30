import { z } from "zod";

export const updateCartItemQuantitySchema = z
  .object({
    itemId: z.string().min(1),
    quantity: z.number().int().min(1),
  })
  .strict();

export type UpdateCartItemQuantityInput = z.infer<
  typeof updateCartItemQuantitySchema
>;
