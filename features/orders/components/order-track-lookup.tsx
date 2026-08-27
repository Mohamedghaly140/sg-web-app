"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  parseTrackingInput,
  TRACKING_INPUT_INVALID_MESSAGE,
} from "@/features/orders/lib/tracking-input";

export function OrderTrackLookup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawValue = formData.get("trackingToken");
    const token = parseTrackingInput(
      typeof rawValue === "string" ? rawValue : "",
    );

    if (!token) {
      setError(TRACKING_INPUT_INVALID_MESSAGE);
      return;
    }

    setError(null);
    router.push(`/orders/track/${token}`);
  }

  function handleInputChange() {
    if (error) setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Your private tracking link was emailed to you after checkout. Paste the
        full link or enter its tracking code below.
      </p>
      <form className="flex items-end gap-2" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="tracking-token">Tracking link or code</Label>
          <Input
            id="tracking-token"
            name="trackingToken"
            type="text"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "tracking-token-error" : undefined}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit">Track order</Button>
      </form>
      {error ? (
        <p
          id="tracking-token-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
