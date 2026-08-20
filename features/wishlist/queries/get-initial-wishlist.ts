import "server-only";

import { auth } from "@clerk/nextjs/server";

import { getWishlist } from "@/features/wishlist/queries/get-wishlist";
import type { Wishlist } from "@/features/wishlist/types/wishlist";

export type InitialWishlist =
  | { userId: string; wishlist: Wishlist }
  | undefined;

export async function getInitialWishlist(): Promise<InitialWishlist> {
  const { userId } = await auth();
  if (!userId) return undefined;

  try {
    return { userId, wishlist: await getWishlist() };
  } catch {
    return undefined;
  }
}
