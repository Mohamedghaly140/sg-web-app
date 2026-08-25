"use client";

import {
  LucideRefreshCw,
  LucideTrash2,
  LucideTriangleAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog";
import { Money } from "@/components/shared/money";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import Spinner from "@/components/shared/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  availableForProduct,
  type CartErrorView,
} from "@/features/cart/hooks/use-cart-error-state";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";
import { useUpdateCartItemQuantity } from "@/features/cart/hooks/use-update-cart-item-quantity";
import type { CartActionResult, CartItem } from "@/features/cart/types/cart";
import { cldUrl, isSameDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

type CartLineItemProps = {
  item: CartItem;
  error: CartErrorView | undefined;
  isInFlight: boolean;
  isFirst: boolean;
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
  isFirst,
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
  const lowStock = item.product.quantity > 0 && item.product.quantity <= 3;
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
    <li className="border-b border-border">
      <article
        className={cn("flex flex-col gap-3 pb-4", !isFirst && "pt-4")}
      >
        <div className="flex gap-4">
          <Link
            href={`/products/${item.product.slug}`}
            className="relative aspect-[3/4] w-[100px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="plate absolute inset-0 overflow-hidden">
              <Image
                src={cldUrl(item.product.imageUrl, {
                  width: 200,
                  height: 267,
                  crop: "fill",
                  gravity: "auto",
                  quality: "auto",
                  format: "auto",
                })}
                alt={item.product.name}
                fill
                sizes="100px"
                className="object-cover"
              />
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-baseline justify-between gap-4">
              <Link
                href={`/products/${item.product.slug}`}
                className="min-w-0 font-heading text-[19px] leading-tight font-normal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {item.product.name}
              </Link>
              <span className="shrink-0 text-[14.5px] figures">
                <Money value={item.lineTotal} />
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {item.color ? (
                <>
                  {item.color}
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              {item.size ? (
                <>
                  {item.size}
                  <span aria-hidden="true"> · </span>
                </>
              ) : null}
              <Money value={item.price} /> each
            </p>

            {priceChanged ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="info">Price updated</Badge>
                <span>
                  Current price <Money value={item.product.priceAfterDiscount} />
                </span>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={item.quantity}
                min={1}
                max={item.product.quantity}
                disabled={pending}
                itemLabel={item.product.name}
                onValueChange={replaceQuantity}
              />
              {lowStock ? (
                <Badge variant="accent">{item.product.quantity} left</Badge>
              ) : null}
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    className="ml-auto"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    Remove
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
                className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
                role="status"
              >
                <Spinner className="size-3.5" />
                Updating cart…
              </div>
            ) : null}

            {error?.code === "INSUFFICIENT_STOCK" ? (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {structuredAvailable === undefined
                  ? "Available stock changed. Choose another quantity."
                  : `Only ${structuredAvailable} available.`}
              </p>
            ) : null}

            {error?.code === "VALIDATION_ERROR" ? (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {error.message} This cart control needs to be refreshed.
              </p>
            ) : null}
          </div>
        </div>

        {productUnavailable ? (
          <Alert>
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
          <Alert>
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
    </li>
  );
}
