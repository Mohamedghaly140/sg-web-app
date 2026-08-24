"use client";

import { useState } from "react";

import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useValidateCoupon } from "@/features/checkout/hooks/use-validate-coupon";
import type { CouponPreview } from "@/features/checkout/types/coupon";

const COUPON_ERROR_COPY: Record<string, string> = {
  RESOURCE_NOT_FOUND: "We couldn't find that coupon code.",
  COUPON_EXPIRED: "This coupon has expired.",
  COUPON_INACTIVE: "This coupon is no longer active.",
  COUPON_EXHAUSTED: "This coupon has reached its usage limit.",
  COUPON_USER_LIMIT: "You've already used this coupon.",
  RATE_LIMITED: "Too many attempts — try again in a moment.",
};

export type CouponFormProps = {
  applied: CouponPreview | null;
  onApplied: (preview: CouponPreview | null) => void;
};

// Never passes `email` — §06-coupons.md skips the per-user check on preview
// when it's absent, and guest checkout always revalidates with
// `contact.email` at final order submission regardless (see plan Context).
export function CouponForm({ applied, onApplied }: CouponFormProps) {
  const [code, setCode] = useState(applied?.code ?? "");
  const mutation = useValidateCoupon({
    onSuccess: (result) => {
      onApplied("error" in result ? null : result);
    },
  });

  const result = mutation.data;
  const errorMessage =
    result && "error" in result
      ? (COUPON_ERROR_COPY[result.error.code] ?? result.error.message)
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Coupon code"
          maxLength={30}
          disabled={mutation.isPending}
          aria-label="Coupon code"
        />
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending || code.trim().length < 3}
          onClick={() => mutation.mutate({ code })}
        >
          {mutation.isPending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {applied ? (
        <div className="flex items-center justify-between text-sm">
          <Badge variant="success">{applied.code} applied</Badge>
          <span className="text-muted-foreground">-<Money value={applied.discountApplied} /></span>
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
