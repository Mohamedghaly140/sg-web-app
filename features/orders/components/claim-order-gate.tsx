"use client";

import { Show } from "@clerk/nextjs";

import { RequireAuth } from "@/components/shared/require-auth/require-auth";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { ClaimOrderForm } from "@/features/orders/components/claim-order-form";

type ClaimOrderGateProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export function ClaimOrderGate({ action }: ClaimOrderGateProps) {
  return (
    <>
      <Show when="signed-in">
        <ClaimOrderForm action={action} />
      </Show>
      <Show when="signed-out">
        <RequireAuth
          title="Sign in to claim this order"
          description="Sign in or create an account to add this order to your order history. You'll return to this tracking page."
          trigger={<Button type="button">Claim this order</Button>}
        />
      </Show>
    </>
  );
}
