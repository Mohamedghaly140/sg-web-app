"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import Spinner from "@/components/shared/spinner";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GuestContactStep } from "@/features/checkout-guest/components/guest-contact-step";
import { GuestReviewStep } from "@/features/checkout-guest/components/guest-review-step";
import { GuestShippingStep } from "@/features/checkout-guest/components/guest-shipping-step";
import { placeGuestOrderAction } from "@/features/checkout/actions/place-guest-order";
import { CheckoutStepRail } from "@/features/checkout/components/checkout-step-rail";
import { CompletedStepSummary } from "@/features/checkout/components/completed-step-summary";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import type { GuestCheckoutStep } from "@/features/checkout/hooks/checkout-search-params";
import { useGuestCheckoutStep } from "@/features/checkout/hooks/use-checkout-step";
import { parseCheckoutStructuredErrors } from "@/features/checkout/lib/checkout-error-resolver";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { fetchCurrentCart, useCart } from "@/features/cart/hooks/use-cart";
import { EMPTY_CART, type Cart } from "@/features/cart/types/cart";

const STEP_ITEMS = [
  { key: "contact", label: "Contact" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
] as const satisfies readonly { key: GuestCheckoutStep; label: string }[];

export function GuestCheckoutWizard() {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const [step, setStep] = useGuestCheckoutStep();
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [contactSummary, setContactSummary] = useState("");
  const [shippingSummary, setShippingSummary] = useState("");
  const [placedOrder, setPlacedOrder] = useState<{
    humanOrderId: string;
    itemsSubtotal: string;
    discountApplied: string;
    shippingFees: string;
    totalOrderPrice: string;
  } | null>(null);

  const [actionState, formAction] = useActionState(placeGuestOrderAction, EMPTY_ACTION_STATE);
  const cart: Cart | undefined = cartQuery.data;
  const { variantErrors, stockErrors } = parseCheckoutStructuredErrors(actionState.response);

  // `queryClient.setQueryData` is a side effect and must not run during
  // render — `Form`'s `onSuccess` (via `useActionFeedback`) fires it exactly
  // once per new SUCCESS `actionState.timestamp` instead.
  const handleSuccess = () => {
    if (cartQuery.data && cartQuery.data.items.length > 0) {
      queryClient.setQueryData(cartKeys.current, EMPTY_CART);
    }
    if (
      typeof actionState.response?.humanOrderId === "string" &&
      typeof actionState.response.itemsSubtotal === "string" &&
      typeof actionState.response.discountApplied === "string" &&
      typeof actionState.response.shippingFees === "string" &&
      typeof actionState.response.totalOrderPrice === "string"
    ) {
      setPlacedOrder({
        humanOrderId: actionState.response.humanOrderId,
        itemsSubtotal: actionState.response.itemsSubtotal,
        discountApplied: actionState.response.discountApplied,
        shippingFees: actionState.response.shippingFees,
        totalOrderPrice: actionState.response.totalOrderPrice,
      });
    }
  };

  if (placedOrder) {
    return (
      <OrderConfirmation
        humanOrderId={placedOrder.humanOrderId}
        itemsSubtotal={placedOrder.itemsSubtotal}
        discountApplied={placedOrder.discountApplied}
        shippingFees={placedOrder.shippingFees}
        totalOrderPrice={placedOrder.totalOrderPrice}
        isGuest
      />
    );
  }

  if (cartQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Loading cart">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (cartQuery.isError && !cartQuery.data) {
    return (
      <Alert variant="destructive">
        <LucideTriangleAlert />
        <AlertTitle>Unable to load your cart</AlertTitle>
        <AlertDescription>
          Check your connection, then try again.
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={cartQuery.isFetching}
            onClick={() => void cartQuery.refetch()}
          >
            {cartQuery.isFetching ? "Retrying…" : "Retry"}
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<LucideShoppingBag className="size-6" />}
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={
          <Button render={<Link href="/products" />} nativeButton={false}>
            Continue shopping
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CheckoutStepRail steps={STEP_ITEMS} currentStep={step.step} />

      {step.step !== "contact" && contactSummary ? (
        <CompletedStepSummary
          label="01 · Contact"
          value={contactSummary}
          onChange={() => void setStep({ step: "contact" })}
        />
      ) : null}
      {step.step !== "contact" &&
      step.step !== "shipping" &&
      shippingSummary ? (
        <CompletedStepSummary
          label="02 · Shipping"
          value={shippingSummary}
          onChange={() => void setStep({ step: "shipping" })}
        />
      ) : null}
      {step.step === "review" ? (
        <CompletedStepSummary
          label="03 · Payment"
          value="Cash on delivery"
          onChange={() => void setStep({ step: "payment" })}
        />
      ) : null}

      <Form
        action={formAction}
        actionState={actionState}
        onSuccess={handleSuccess}
        onError={() => {
          const checkoutCode = actionState.response?.checkoutCode;
          if (
            checkoutCode === "INSUFFICIENT_STOCK" ||
            checkoutCode === "INVALID_VARIANT" ||
            checkoutCode === "CART_EMPTY"
          ) {
            void fetchCurrentCart()
              .then((freshCart) => {
                queryClient.setQueryData(cartKeys.current, freshCart);
              })
              .catch(() => {});
          }

          const responseStep = actionState.response?.step;
          if (responseStep === "address") {
            void setStep({ step: "shipping" });
          } else if (
            responseStep === "payment" ||
            checkoutCode === "PAYMENT_METHOD_UNAVAILABLE"
          ) {
            void setStep({ step: "payment" });
          } else if (responseStep) {
            void setStep({ step: "review" });
          }

          const fieldErrorKeys = Object.keys(actionState.fieldErrors ?? {});
          if (fieldErrorKeys.some((key) => key.startsWith("contact."))) {
            void setStep({ step: "contact" });
          } else if (
            fieldErrorKeys.some(
              (key) => key.startsWith("shipping.") || key === "notes",
            )
          ) {
            void setStep({ step: "shipping" });
          } else if (fieldErrorKeys.includes("paymentMethod")) {
            void setStep({ step: "payment" });
          }
        }}
      >
        <GuestContactStep
          active={step.step === "contact"}
          actionState={actionState}
          onNext={() => void setStep({ step: "shipping" })}
          onSummaryChange={setContactSummary}
        />
        <GuestShippingStep
          active={step.step === "shipping"}
          actionState={actionState}
          onNext={() => void setStep({ step: "payment" })}
          onBack={() => void setStep({ step: "contact" })}
          onFeeChange={setShippingFee}
          onSummaryChange={setShippingSummary}
        />
        <GuestReviewStep
          step={step.step}
          cart={cart}
          shippingFee={shippingFee}
          applied={applied}
          onApplied={setApplied}
          onPaymentBack={() => void setStep({ step: "shipping" })}
          onPaymentNext={() => void setStep({ step: "review" })}
          onReviewBack={() => void setStep({ step: "payment" })}
          variantErrors={variantErrors}
          stockErrors={stockErrors}
        />
      </Form>
    </div>
  );
}
