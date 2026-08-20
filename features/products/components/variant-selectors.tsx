"use client";

import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  availableForProduct,
  variantErrorForProduct,
} from "@/features/cart/hooks/use-cart-error-state";
import { getColorSwatch } from "@/features/products/components/color-swatch-map";
import { useProductPurchase } from "@/features/products/components/product-purchase-provider";
import { StockBadge } from "@/features/products/components/stock-badge";

type VariantSelectorsProps = {
  sizes: string[];
  colors: string[];
  quantity: number;
};

export function VariantSelectors({
  sizes,
  colors,
  quantity,
}: VariantSelectorsProps) {
  const {
    productId,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedQuantity,
    setSelectedQuantity,
    error,
    isAdding,
    isProductUnavailable,
    addToCart,
  } = useProductPurchase();
  const soldOut = quantity <= 0 || isProductUnavailable;
  const available = availableForProduct(error, productId);
  const variantError = variantErrorForProduct(error, productId);
  const variantRejected =
    variantError !== undefined || error?.code === "INVALID_VARIANT";

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-foreground">
            Color
            {selectedColor && (
              <span className="ml-1 font-normal text-muted-foreground">
                — {selectedColor}
              </span>
            )}
          </legend>
          <ToggleGroup
            className="flex-wrap gap-2"
            aria-label="Color"
            value={selectedColor ? [selectedColor] : []}
            onValueChange={(next) => {
              const nextColor = next[next.length - 1];
              if (nextColor) {
                setSelectedColor(nextColor);
              }
            }}
          >
            {colors.map((color) => (
              <ToggleGroupItem
                key={color}
                value={color}
                type="button"
                variant="outline"
                aria-label={color}
                title={color}
                className="size-9 shrink-0 rounded-full border border-input p-0 shadow-none data-pressed:ring-2 data-pressed:ring-accent data-pressed:ring-offset-2 data-pressed:ring-offset-background"
                style={{
                  backgroundColor: getColorSwatch(color) ?? "var(--muted)",
                }}
              />
            ))}
          </ToggleGroup>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-foreground">Size</legend>
          <ToggleGroup
            className="flex-wrap gap-2"
            aria-label="Size"
            value={selectedSize ? [selectedSize] : []}
            onValueChange={(next) => {
              const nextSize = next[next.length - 1];
              if (nextSize) {
                setSelectedSize(nextSize);
              }
            }}
          >
            {sizes.map((size) => (
              <ToggleGroupItem
                key={size}
                value={size}
                type="button"
                variant="outline"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-input text-sm font-medium shadow-none data-pressed:border-transparent data-pressed:bg-foreground data-pressed:text-background data-pressed:ring-2 data-pressed:ring-accent data-pressed:ring-offset-2 data-pressed:ring-offset-background"
              >
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
      )}

      {variantRejected && (
        <p className="text-xs text-destructive" role="alert">
          That variant is unavailable. Choose another option.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <QuantityStepper
          value={selectedQuantity}
          min={1}
          max={quantity}
          disabled={soldOut || isAdding}
          onValueChange={setSelectedQuantity}
        />
        {available !== undefined && (
          <p className="text-xs text-destructive" role="status">
            Only {available} available
          </p>
        )}
        <StockBadge quantity={quantity} />
      </div>

      <div className="flex flex-col gap-2">
        <div
          className="grid grid-cols-2 gap-2"
          data-product-purchase-actions
        >
          <Button
            type="button"
            onClick={addToCart}
            disabled={soldOut || isAdding}
          >
            {soldOut ? "Sold out" : isAdding ? "Adding…" : "Add to Cart"}
          </Button>
          <Button type="button" variant="outline" disabled>
            Buy Now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Checkout is coming soon.
        </p>
      </div>
    </div>
  );
}
