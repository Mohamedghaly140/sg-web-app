"use client";

import { clearCartAction } from "@/features/cart/actions/clear-cart";
import {
  useCartMutation,
  type CartMutationOptions,
} from "@/features/cart/hooks/use-cart-mutation";

export function useClearCart(options?: CartMutationOptions<void>) {
  return useCartMutation(() => clearCartAction(), options);
}
