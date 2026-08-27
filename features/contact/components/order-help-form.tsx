"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  parseTrackingInput,
  TRACKING_INPUT_INVALID_MESSAGE,
} from "@/features/orders/lib/tracking-input";

export function OrderHelpForm() {
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
    <Card size="sm" className="gap-2">
      <CardContent className="flex flex-col gap-2">
        <p className="text-kicker">Order help</p>
        <p className="text-base font-medium text-foreground">
          Asking about an order you already placed?
        </p>
        <p className="text-sm text-muted-foreground">
          Open it with the tracking link from your confirmation email — or
          paste the link&apos;s code here and we will pull the order up before
          you write anything.
        </p>
        <form onSubmit={handleSubmit} noValidate className="mt-2 flex gap-2">
          <Input
            name="trackingToken"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Tracking code from your email"
            aria-label="Tracking link or code"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "order-help-token-error" : undefined}
            onChange={handleInputChange}
          />
          <Button type="submit" className="shrink-0">
            Find order
          </Button>
        </form>
        {error ? (
          <p
            id="order-help-token-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
