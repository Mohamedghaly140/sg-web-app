import "server-only";

import { getCart } from "@/features/cart/queries/get-cart";
import type { Cart } from "@/features/cart/types/cart";

export async function getInitialCart(): Promise<Cart | undefined> {
  try {
    return await getCart();
  } catch {
    // `getCart()` throws `ApiError`, but an unhandled root-layout error would
    // take down every route, including catalog-only pages. Keep the fallback
    // here so `app/` stays free of feature logic, and return `undefined` rather
    // than a fabricated empty cart: an absent seed lets `useCart()` fetch and
    // expose its real loading/error state instead of caching fake data as fresh.
    return undefined;
  }
}
