"use client";

import { createContext } from "react";

import type { Cart } from "@/features/cart/types/cart";

/**
 * Carries the root layout's server-read cart down to `useCart()` so the Header
 * badge and drawer can start from server data without taking an argument. An
 * explicit `useCart(initialData)` argument always wins over this context.
 */
export const CartInitialDataContext = createContext<Cart | undefined>(
  undefined,
);

export type CartInitialDataProviderProps = {
  cart: Cart | undefined;
  children: React.ReactNode;
};

export function CartInitialDataProvider({
  cart,
  children,
}: CartInitialDataProviderProps) {
  return (
    <CartInitialDataContext.Provider value={cart}>
      {children}
    </CartInitialDataContext.Provider>
  );
}
