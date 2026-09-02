"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cancelOrderAction } from "@/features/orders/actions/cancel-order";

export type CancelOrderButtonProps = {
  orderId: string;
  label?: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function CancelOrderButton({
  orderId,
  label = "Cancel order",
  className,
  variant = "destructive",
  size = "default",
}: CancelOrderButtonProps) {
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
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={isPending}
          className={className}
        >
          {label}
        </Button>
      }
      onConfirm={handleConfirm}
    />
  );
}
