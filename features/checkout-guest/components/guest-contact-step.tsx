"use client";

import FormControl from "@/components/shared/form-control";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { Button } from "@/components/ui/button";

export type GuestContactStepProps = {
  active: boolean;
  actionState: ActionState;
  onNext: () => void;
};

export function GuestContactStep({ active, actionState, onNext }: GuestContactStepProps) {
  return (
    <section hidden={!active} className="flex flex-col gap-4" aria-label="Contact details">
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
      <FormControl
        name="contact.email"
        label="Email"
        type="email"
        actionState={actionState}
      />
      <p className="text-sm text-muted-foreground">
        We&apos;ll email your order confirmation and tracking link here.
      </p>
      <Button type="button" onClick={onNext} className="self-end">
        Continue to shipping
      </Button>
    </section>
  );
}
