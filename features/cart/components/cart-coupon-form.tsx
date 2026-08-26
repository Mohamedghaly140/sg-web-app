"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useValidateCoupon } from "@/features/checkout/hooks/use-validate-coupon";
import { validateCouponSchema } from "@/features/checkout/schema/coupon-schema";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import { useCart } from "@/features/cart/hooks/use-cart";
import { COUPON_ERROR_COPY } from "@/lib/constants/coupon-error-copy";

export function CartCouponForm() {
  const [code, setCode] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const mutation = useValidateCoupon({
    onMutate: () => {
      setValidationError(undefined);
    },
  });

  const result = mutation.data;
  const preview: CouponPreview | undefined =
    result && !("error" in result) ? result : undefined;
  // Stale once the input no longer matches the code that produced it.
  const previewMatchesCode =
    preview !== undefined &&
    preview.code.toLowerCase() === code.trim().toLowerCase();
  const actionError =
    result && "error" in result
      ? (COUPON_ERROR_COPY[result.error.code] ?? result.error.message)
      : undefined;
  const errorMessage = validationError ?? actionError ?? mutation.error?.message;
  const feedbackId = "cart-coupon-feedback";

  const cartQuery = useCart();
  const cartTotal = cartQuery.data?.totalPriceAfterDiscount;
  const previousCartTotal = useRef(cartTotal);

  useEffect(() => {
    if (previousCartTotal.current !== cartTotal) {
      previousCartTotal.current = cartTotal;
      if (mutation.data) {
        mutation.reset();
      }
    }
  }, [cartTotal, mutation]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = validateCouponSchema.safeParse({ code });

    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? "Enter a valid coupon code.",
      );
      return;
    }

    mutation.mutate(parsed.data);
  }

  return (
    <form className="flex flex-col gap-1.5" onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <Field className="min-w-0 gap-1" data-invalid={Boolean(errorMessage)}>
          <FieldLabel htmlFor="cart-coupon-code" className="sr-only">
            Coupon code
          </FieldLabel>
          <Input
            id="cart-coupon-code"
            name="couponCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Coupon code"
            maxLength={30}
            disabled={mutation.isPending}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage || previewMatchesCode ? feedbackId : undefined
            }
            className="tracking-wider"
          />
        </Field>
        <Button
          type="submit"
          variant="secondary"
          disabled={mutation.isPending || code.trim().length < 3}
        >
          {mutation.isPending ? "Checking…" : "Apply"}
        </Button>
      </div>
      {preview && previewMatchesCode && !errorMessage ? (
        <p
          id={feedbackId}
          className="text-2xs text-accent-strong"
          aria-live="polite"
        >
          {preview.code} previews <Money value={preview.discountApplied} /> off.
          Revalidated at checkout.
        </p>
      ) : null}
      {errorMessage ? (
        <p id={feedbackId} className="text-2xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
