"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "@/features/orders/actions/cancel-order";

export type CancelOrderButtonProps = {
  orderId: string;
};

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    const fd = new FormData();
    fd.set("id", orderId);

    startTransition(async () => {
      const result = await cancelOrderAction(EMPTY_ACTION_STATE, fd);
      if (result.status === "SUCCESS" && result.message) {
        toast.success(result.message);
      } else if (result.status === "ERROR" && result.message) {
        toast.error(result.message);
      }
    });
  };

  return (
    <ConfirmDialog
      title="Cancel this order?"
      description="Stock for this order returns to inventory, and any coupon used on it is released. This cannot be undone."
      confirmLabel="Cancel order"
      variant="destructive"
      trigger={
        <Button type="button" variant="destructive" disabled={isPending}>
          Cancel order
        </Button>
      }
      onConfirm={handleConfirm}
    />
  );
}
