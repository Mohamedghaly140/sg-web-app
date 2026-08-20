"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import { setDefaultAddressAction } from "@/features/addresses/actions/set-default-address";

export type SetDefaultAddressButtonProps = {
  addressId: string;
};

export function SetDefaultAddressButton({
  addressId,
}: SetDefaultAddressButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const fd = new FormData();
    fd.set("id", addressId);
    startTransition(async () => {
      const result = await setDefaultAddressAction(EMPTY_ACTION_STATE, fd);
      if (result.status === "ERROR") {
        if (result.message) toast.error(result.message);
      } else if (result.message) {
        toast.success(result.message);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
    >
      Set as default
    </Button>
  );
}
