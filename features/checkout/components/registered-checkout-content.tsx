"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LucideShoppingBag, LucideTriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import Form from "@/components/shared/form/form";
import { EMPTY_ACTION_STATE } from "@/components/shared/form/utils/to-action-state";
import Spinner from "@/components/shared/spinner";
import SubmitButton from "@/components/shared/submit-button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddressForm } from "@/features/addresses/components/address-form";
import type { Address } from "@/features/addresses/types/address";
import { placeOrderAction } from "@/features/checkout/actions/place-order";
import { CheckoutCartSummary } from "@/features/checkout/components/checkout-cart-summary";
import { CouponForm } from "@/features/checkout/components/coupon-form";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import { PaymentMethodSelect } from "@/features/checkout/components/payment-method-select";
import { ShippingEstimate } from "@/features/checkout/components/shipping-estimate";
import { parseCheckoutStructuredErrors } from "@/features/checkout/lib/checkout-error-resolver";
import type { CouponPreview } from "@/features/checkout/types/coupon";
import type { ShippingFee } from "@/features/checkout/types/shipping";
import { cartKeys } from "@/features/cart/hooks/cart-keys";
import { fetchCurrentCart, useCart } from "@/features/cart/hooks/use-cart";
import { EMPTY_CART } from "@/features/cart/types/cart";
import { DEFAULT_COUNTRY } from "@/lib/constants/egypt-locations";

export type RegisteredCheckoutContentProps = {
  addresses: Address[];
};

export function RegisteredCheckoutContent({ addresses }: RegisteredCheckoutContentProps) {
  const cartQuery = useCart();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [shippingFee, setShippingFee] = useState<ShippingFee | null>(null);
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [showCreateAddress, setShowCreateAddress] = useState(addresses.length === 0);
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

  const handleResolved = useCallback((fee: ShippingFee | null) => {
    setShippingFee(fee);
  }, []);

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
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
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
        }}
      >
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Shipping address
          </h2>
          {addresses.length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start gap-3 border border-border p-3 text-sm has-checked:border-primary"
                >
                  <input
                    type="radio"
                    name="shippingAddressId"
                    value={address.id}
                    checked={selectedId === address.id}
                    onChange={() => setSelectedId(address.id)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="flex flex-col">
                    <span className="font-medium text-foreground">{address.alias}</span>
                    <span className="text-muted-foreground">
                      {address.addressLine1}, {address.area}, {address.city},{" "}
                      {address.governorate}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <Sheet open={showCreateAddress} onOpenChange={setShowCreateAddress}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                />
              }
            >
              Add a new address
            </SheetTrigger>
            <SheetContent className="data-[side=right]:sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add a new address</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                <AddressForm
                  variant="create"
                  hasExistingAddresses={addresses.length > 0}
                  onDone={() => {
                    setShowCreateAddress(false);
                    router.refresh();
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {selectedAddress ? (
            <ShippingEstimate
              country={DEFAULT_COUNTRY}
              governorate={selectedAddress.governorate}
              city={selectedAddress.city}
              onResolved={handleResolved}
            />
          ) : null}
        </section>

        <section className="mt-6 flex flex-col gap-4">
          <CouponForm applied={applied} onApplied={setApplied} />
          <input type="hidden" name="couponCode" value={applied?.code ?? ""} />
          <PaymentMethodSelect name="paymentMethod" />
          <SubmitButton
            label="Place order"
            disabled={!selectedAddress || !shippingFee}
            className="self-end"
          />
        </section>
      </Form>

      <Card>
        <CardContent className="pt-6">
          <CheckoutCartSummary
            cart={cart}
            variantErrors={variantErrors}
            stockErrors={stockErrors}
          />
        </CardContent>
      </Card>
    </div>
  );
}
