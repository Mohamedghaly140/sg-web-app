"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import Spinner from "@/components/shared/spinner";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/addresses/types/address";
import { placeOrderAction } from "@/features/checkout/actions/place-order";
import { CheckoutStepRail } from "@/features/checkout/components/checkout-step-rail";
import { CompletedStepSummary } from "@/features/checkout/components/completed-step-summary";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import { RegisteredAddressStep } from "@/features/checkout/components/registered-address-step";
import { RegisteredPaymentStep } from "@/features/checkout/components/registered-payment-step";
import { RegisteredReviewStep } from "@/features/checkout/components/registered-review-step";
import type { RegisteredCheckoutStep } from "@/features/checkout/hooks/checkout-search-params";
import { useRegisteredCheckoutStep } from "@/features/checkout/hooks/use-checkout-step";
import { parseCheckoutStructuredErrors } from "@/features/checkout/lib/checkout-error-resolver";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { fetchCurrentCart, useCart } from "@/features/cart/hooks/use-cart";
import { EMPTY_CART } from "@/features/cart/types/cart";

const STEP_ITEMS = [
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
] as const satisfies readonly { key: RegisteredCheckoutStep; label: string }[];

export type RegisteredCheckoutContentProps = {
  addresses: Address[];
};

export function RegisteredCheckoutContent({ addresses }: RegisteredCheckoutContentProps) {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [step, setStep] = useRegisteredCheckoutStep();
  const [selectedId, setSelectedId] = useState(
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{
    humanOrderId: string;
    orderId?: string;
    itemsSubtotal: string;
    discountApplied: string;
    shippingFees: string;
    totalOrderPrice: string;
  } | null>(null);

  const [actionState, formAction] = useActionState(placeOrderAction, EMPTY_ACTION_STATE);
  const { variantErrors, stockErrors } = parseCheckoutStructuredErrors(actionState.response);
  const selectedAddress = addresses.find((address) => address.id === selectedId) ?? null;

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
        orderId:
          typeof actionState.response.orderId === "string"
            ? actionState.response.orderId
            : undefined,
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
        orderId={placedOrder.orderId}
        itemsSubtotal={placedOrder.itemsSubtotal}
        discountApplied={placedOrder.discountApplied}
        shippingFees={placedOrder.shippingFees}
        totalOrderPrice={placedOrder.totalOrderPrice}
        isGuest={false}
      />
    );
  }

  const cart = cartQuery.data;

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

      {step.step !== "address" && selectedAddress ? (
        <CompletedStepSummary
          label="01 · Address"
          value={`${selectedAddress.alias} — ${selectedAddress.addressLine1}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.governorate}`}
          onChange={() => void setStep({ step: "address" })}
        />
      ) : null}
      {step.step === "review" ? (
        <CompletedStepSummary
          label="02 · Payment"
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
          if (checkoutCode === "RESOURCE_NOT_FOUND") {
            router.refresh();
            setApplied(null);
          }

          const responseStep = actionState.response?.step;
          if (responseStep === "address") {
            void setStep({ step: "address" });
          } else if (responseStep === "payment") {
            void setStep({ step: "payment" });
          } else if (responseStep) {
            void setStep({ step: "review" });
          }
        }}
      >
        <RegisteredAddressStep
          active={step.step === "address"}
          addresses={addresses}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onFeeChange={setShippingFee}
          onNext={() => void setStep({ step: "payment" })}
        />
        <RegisteredPaymentStep
          active={step.step === "payment"}
          onBack={() => void setStep({ step: "address" })}
          onNext={() => void setStep({ step: "review" })}
        />
        <RegisteredReviewStep
          active={step.step === "review"}
          cart={cart}
          selectedAddress={selectedAddress}
          shippingFee={shippingFee}
          applied={applied}
          onApplied={setApplied}
          onBack={() => void setStep({ step: "payment" })}
          variantErrors={variantErrors}
          stockErrors={stockErrors}
        />
      </Form>
    </div>
  );
}
