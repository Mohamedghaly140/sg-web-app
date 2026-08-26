"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimTokenSchema } from "@/features/orders/schema/claim-token-schema";

const INVALID_TOKEN_MESSAGE =
  "That doesn't look like a valid tracking link or code.";

export function OrderTrackLookup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawValue = formData.get("trackingToken");
    const value = typeof rawValue === "string" ? rawValue.trim() : "";
    const token = value.includes("/")
      ? (value.split("/").filter(Boolean).at(-1) ?? "")
      : value;
    const parsed = claimTokenSchema.safeParse(token);

    if (!parsed.success) {
      setError(INVALID_TOKEN_MESSAGE);
      return;
    }

    setError(null);
    router.push(`/orders/track/${parsed.data}`);
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
