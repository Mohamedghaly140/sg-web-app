"use client";

import type { MouseEvent } from "react";

import FormControl from "@/components/shared/form-control";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";

export type GuestContactStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
  onSummaryChange: (summary: string) => void;
};

export function GuestContactStep({
  active,
  actionState,
  onNext,
  onSummaryChange,
}: GuestContactStepProps) {
  function handleNext(event: MouseEvent<HTMLButtonElement>) {
    const formData = new FormData(event.currentTarget.form!);
    const name = formData.get("contact.name")?.toString().trim() ?? "";
    const phone = formData.get("contact.phone")?.toString().trim() ?? "";

    onSummaryChange([name, phone].filter(Boolean).join(" · "));
    onNext();
  }

  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Contact details">
      <div className="grid grid-cols-2 gap-3">
        <FormControl
          name="contact.name"
          label="Full name"
          type="text"
          maxLength={120}
          actionState={actionState}
        />
        <FormControl
          name="contact.phone"
          label="Phone"
          type="tel"
          placeholder="+201000000001"
          actionState={actionState}
        />
        <div className="col-span-full">
          <FormControl
            name="contact.email"
            label="Email — receives the receipt and your tracking link"
            type="email"
            actionState={actionState}
          />
        </div>
      </div>
      <Button type="button" onClick={handleNext} className="self-end">
        Continue to shipping
      </Button>
    </section>
  );
}
