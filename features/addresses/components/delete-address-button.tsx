"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { deleteAddressAction } from "@/features/addresses/actions/delete-address";

export type DeleteAddressButtonProps = {
  addressId: string;
  className?: string;
};

export function DeleteAddressButton({
  addressId,
  className,
}: DeleteAddressButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title="Delete this address?"
      description="This cannot be undone. If this is your default address, the most recent remaining address becomes the default."
      confirmLabel="Delete"
      variant="destructive"
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={className}
          disabled={isPending}
        >
          Delete
        </Button>
      }
      onConfirm={() => {
        const fd = new FormData();
        fd.set("id", addressId);
        startTransition(async () => {
          const result = await deleteAddressAction(EMPTY_ACTION_STATE, fd);
          if (result.status === "ERROR") {
            if (result.message) toast.error(result.message);
          } else if (result.message) {
            toast.success(result.message);
          }
        });
      }}
    />
  );
}
