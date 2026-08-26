import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  quantity: z.number(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  price: z.string(),
  lineTotal: z.string(),
});

export const orderItemsSchema = z.array(orderItemSchema);
export type OrderItemParsed = z.infer<typeof orderItemSchema>;

export function parseOrderItems(value: unknown): OrderItemParsed[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = orderItemsSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
