"use client";

import { syncCartAction } from "@/features/cart/actions/sync-cart";
import {
  useCartMutation,
  type CartMutationOptions,
} from "@/features/cart/hooks/use-cart-mutation";

export function useSyncCart(options?: CartMutationOptions<void>) {
  return useCartMutation(syncCartAction, options);
}
