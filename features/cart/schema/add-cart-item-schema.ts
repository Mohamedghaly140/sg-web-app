import { z } from "zod";

export const addCartItemSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    color: z.string().min(1).optional(),
    size: z.string().min(1).optional(),
  })
  .strict();

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
