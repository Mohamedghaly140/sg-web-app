"use client";

import { addCartItemAction } from "@/features/cart/actions/add-cart-item";
import {
  useCartMutation,
  type CartMutationOptions,
} from "@/features/cart/hooks/use-cart-mutation";
import type { AddCartItemInput } from "@/features/cart/schema/add-cart-item-schema";

export function useAddCartItem(
  options?: CartMutationOptions<AddCartItemInput>,
) {
  return useCartMutation(addCartItemAction, options);
}
