import { z } from "zod";

export const deleteReviewSchema = z
  .object({
    reviewId: z.string().min(1),
    productId: z.string().min(1),
    slug: z.string().min(1),
  })
  .strict();

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
