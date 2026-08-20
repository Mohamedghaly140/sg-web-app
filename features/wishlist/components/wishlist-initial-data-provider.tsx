"use client";

import { createContext } from "react";

import type { Wishlist } from "@/features/wishlist/types/wishlist";

export type WishlistInitialData = {
  userId: string;
  wishlist: Wishlist;
};

/**
 * Carries the root layout's server-read wishlist (+ userId) down to
 * `useWishlist()` so hearts and the account page can start from server data
 * without taking an argument. Seeds apply only when context.userId matches the
 * active Clerk userId.
 */
export const WishlistInitialDataContext = createContext<
  WishlistInitialData | undefined
>(undefined);

export type WishlistInitialDataProviderProps = {
  initialWishlist: WishlistInitialData | undefined;
  children: React.ReactNode;
};

export function WishlistInitialDataProvider({
  initialWishlist,
  children,
}: WishlistInitialDataProviderProps) {
  return (
    <WishlistInitialDataContext.Provider value={initialWishlist}>
      {children}
    </WishlistInitialDataContext.Provider>
  );
}
