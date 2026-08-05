"use client";

import { removeCartItemAction } from "@/features/cart/actions/remove-cart-item";
import {
  useCartMutation,
  type CartMutationOptions,
} from "@/features/cart/hooks/use-cart-mutation";
import type { RemoveCartItemInput } from "@/features/cart/schema/remove-cart-item-schema";

export function useRemoveCartItem(
  options?: CartMutationOptions<RemoveCartItemInput>,
) {
  return useCartMutation(removeCartItemAction, options);
}
