import "server-only";

import type { Wishlist } from "@/features/wishlist/types/wishlist";
import { apiFetch } from "@/lib/api/http";

export async function getWishlist(): Promise<Wishlist> {
  return apiFetch<Wishlist>("/wishlist", { auth: "required" });
}
