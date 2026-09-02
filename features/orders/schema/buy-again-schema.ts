import { z } from "zod";

export const buyAgainSchema = z
  .object({
    orderId: z.string().min(1),
  })
  .strict();

export type BuyAgainInput = z.infer<typeof buyAgainSchema>;
