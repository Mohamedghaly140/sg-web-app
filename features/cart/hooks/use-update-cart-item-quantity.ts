"use client";

import { updateCartItemQuantityAction } from "@/features/cart/actions/update-cart-item-quantity";
import {
  useCartMutation,
  type CartMutationOptions,
} from "@/features/cart/hooks/use-cart-mutation";
import type { UpdateCartItemQuantityInput } from "@/features/cart/schema/update-cart-item-quantity-schema";

export function useUpdateCartItemQuantity(
  options?: CartMutationOptions<UpdateCartItemQuantityInput>,
) {
  return useCartMutation(updateCartItemQuantityAction, options);
}
