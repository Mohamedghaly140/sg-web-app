import { z } from "zod";

export const wishlistProductIdSchema = z
  .object({ productId: z.string().min(1) })
  .strict();
