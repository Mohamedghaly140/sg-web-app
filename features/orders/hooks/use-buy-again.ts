"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buyAgainAction } from "@/features/orders/actions/buy-again";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import type { BuyAgainInput } from "@/features/orders/schema/buy-again-schema";

export function useBuyAgain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BuyAgainInput) => buyAgainAction(input),
    retry: false,
    onSuccess(result) {
      if (!("error" in result)) {
        queryClient.setQueryData(cartKeys.current, result.cart);
      }
    },
  });
}
