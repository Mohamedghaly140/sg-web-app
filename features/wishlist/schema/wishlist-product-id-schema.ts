import { z } from "zod";

export const wishlistProductIdSchema = z
  .object({ productId: z.string().min(1) })
  .strict();

export type WishlistProductIdInput = z.infer<typeof wishlistProductIdSchema>;
