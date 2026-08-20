import { z } from "zod";

export const createReviewSchema = z
  .object({
    title: z.string().trim().max(150).optional(),
    ratings: z.coerce.number().min(1).max(5).multipleOf(0.5),
    productId: z.string().min(1),
    slug: z.string().min(1),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
