"use client";

import {
  LucideRefreshCw,
  LucideTrash2,
  LucideTriangleAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import Spinner from "@/components/shared/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  availableForProduct,
  type CartErrorView,
} from "@/features/cart/hooks/use-cart-error-state";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";
import { useUpdateCartItemQuantity } from "@/features/cart/hooks/use-update-cart-item-quantity";
import type { CartActionResult, CartItem } from "@/features/cart/types/cart";
import { cldUrl, formatEGP, isSameDecimal } from "@/lib/format";

type CartLineItemProps = {
  item: CartItem;
  error: CartErrorView | undefined;
  isInFlight: boolean;
  showSeparator: boolean;
  onBeginMutation: (itemId: string) => boolean;
  onMutationResult: (
    item: CartItem,
    result: CartActionResult,
  ) => Promise<void>;
  onUnexpectedError: (itemId: string, error: Error) => void;
};

export function CartLineItem({
  item,
  error,
  isInFlight,
  showSeparator,
  onBeginMutation,
  onMutationResult,
  onUnexpectedError,
}: CartLineItemProps) {
  const updateQuantity = useUpdateCartItemQuantity({
    onSuccess: (result) => {
      void onMutationResult(item, result);
    },
    onError: (mutationError) => {
      onUnexpectedError(item.id, mutationError);
    },
  });
  const removeItem = useRemoveCartItem({
    onSuccess: (result) => {
      void onMutationResult(item, result);
    },
    onError: (mutationError) => {
      onUnexpectedError(item.id, mutationError);
    },
  });

  const priceChanged = !isSameDecimal(
    item.price,
    item.product.priceAfterDiscount,
  );
  const productUnavailable = item.product.status !== "ACTIVE";
  const stockChanged =
    !productUnavailable && item.quantity > item.product.quantity;
  const structuredAvailable = availableForProduct(error, item.product.id);
  const pending =
    isInFlight || updateQuantity.isPending || removeItem.isPending;

  const replaceQuantity = (quantity: number) => {
    if (quantity === item.quantity || !onBeginMutation(item.id)) {
      return;
    }

    updateQuantity.mutate({ itemId: item.id, quantity });
  };

  const remove = () => {
    if (!onBeginMutation(item.id)) {
      return;
    }

    removeItem.mutate({ itemId: item.id });
  };

  return (
    <li>
      <article className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:p-5">
        <Link
          href={`/products/${item.product.slug}`}
          className="relative size-24 overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-32"
        >
          <Image
            src={cldUrl(item.product.imageUrl, {
              width: 256,
              height: 256,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              format: "auto",
            })}
            alt={item.product.name}
            fill
            sizes="(min-width: 640px) 128px, 96px"
            className="object-cover"
          />
        </Link>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Link
              href={`/products/${item.product.slug}`}
              className="w-fit font-heading text-base font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {item.product.name}
            </Link>
            <div className="flex flex-wrap gap-2">
              {item.color ? <Badge variant="outline">{item.color}</Badge> : null}
              {item.size ? <Badge variant="outline">Size {item.size}</Badge> : null}
            </div>
          </div>

          {priceChanged ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="info">Price updated</Badge>
              <span>Current price {formatEGP(item.product.priceAfterDiscount)}</span>
            </div>
          ) : null}
        </div>

        <div className="col-span-2 flex flex-col gap-4 sm:col-span-1 sm:min-w-44 sm:items-end">
          <dl className="flex flex-col gap-1 text-sm sm:items-end">
            <div className="flex items-baseline justify-between gap-4 sm:justify-end">
              <dt className="text-xs text-muted-foreground">Unit price</dt>
              <dd>{formatEGP(item.price)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 sm:justify-end">
              <dt className="text-xs text-muted-foreground">Line total</dt>
              <dd className="font-semibold text-foreground">
                {formatEGP(item.lineTotal)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <QuantityStepper
              value={item.quantity}
              min={1}
              max={item.product.quantity}
              disabled={pending}
              itemLabel={item.product.name}
              onValueChange={replaceQuantity}
            />
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  aria-label={`Remove ${item.product.name} from cart`}
                  disabled={pending}
                >
                  <LucideTrash2 data-icon="inline-start" />
                </Button>
              }
              title="Remove this item?"
              description={`${item.product.name} will be removed from your cart.`}
              confirmLabel="Remove item"
              variant="destructive"
              onConfirm={remove}
            />
          </div>

          {pending ? (
            <div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              role="status"
            >
              <Spinner className="size-4" />
              Updating cart…
            </div>
          ) : null}

          {error?.code === "INSUFFICIENT_STOCK" ? (
            <p className="text-xs text-destructive" role="alert">
              {structuredAvailable === undefined
                ? "Available stock changed. Choose another quantity."
                : `Only ${structuredAvailable} available.`}
            </p>
          ) : null}

          {error?.code === "VALIDATION_ERROR" ? (
            <p className="text-xs text-destructive" role="alert">
              {error.message} This cart control needs to be refreshed.
            </p>
          ) : null}
        </div>

        {productUnavailable ? (
          <Alert className="col-span-full">
            <LucideTriangleAlert />
            <AlertTitle>
              <Badge variant="warning">No longer available</Badge>
            </AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              This product can no longer be purchased. Remove it before checkout.
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                  >
                    <LucideTrash2 data-icon="inline-start" />
                    Remove item
                  </Button>
                }
                title="Remove unavailable item?"
                description={`${item.product.name} will be removed from your cart.`}
                confirmLabel="Remove item"
                variant="destructive"
                onConfirm={remove}
              />
            </AlertDescription>
          </Alert>
        ) : null}

        {stockChanged ? (
          <Alert className="col-span-full">
            <LucideTriangleAlert />
            <AlertTitle>
              <Badge variant="warning">Stock changed</Badge>
            </AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              {item.product.quantity > 0
                ? `Only ${item.product.quantity} can now be purchased.`
                : "This product is currently out of stock."}
              {item.product.quantity > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => replaceQuantity(item.product.quantity)}
                >
                  <LucideRefreshCw data-icon="inline-start" />
                  Reduce to {item.product.quantity}
                </Button>
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                    >
                      <LucideTrash2 data-icon="inline-start" />
                      Remove item
                    </Button>
                  }
                  title="Remove out-of-stock item?"
                  description={`${item.product.name} will be removed from your cart.`}
                  confirmLabel="Remove item"
                  variant="destructive"
                  onConfirm={remove}
                />
              )}
            </AlertDescription>
          </Alert>
        ) : null}
      </article>
      {showSeparator ? <Separator /> : null}
    </li>
  );
}
