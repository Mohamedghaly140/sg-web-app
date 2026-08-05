"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

import { cartKeys } from "@/features/cart/hooks/cart-keys";
import type { CartActionResult } from "@/features/cart/types/cart";

// Type-level exclusions keep mutations pessimistic and preserve retry: 0 from
// the shared QueryClient instead of relying on every caller to remember both.
export type CartMutationOptions<TVariables> = Omit<
  UseMutationOptions<CartActionResult, Error, TVariables>,
  "mutationFn" | "retry" | "onMutate"
>;

export function useCartMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<CartActionResult>,
  options?: CartMutationOptions<TVariables>,
): UseMutationResult<CartActionResult, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn,
    onSuccess: (result, variables, onMutateResult, context) => {
      if (!("error" in result)) {
        queryClient.setQueryData(cartKeys.current, result);
      }

      options?.onSuccess?.(result, variables, onMutateResult, context);
    },
  });
}
