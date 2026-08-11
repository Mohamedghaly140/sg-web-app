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
          <legend className="text-sm font-medium text-foreground">Color</legend>
          <ToggleGroup className="flex-wrap gap-2" aria-label="Color">
            {colors.map((color) => (
              <ToggleGroupItem
                key={color}
                type="button"
                variant="outline"
                className="rounded-full px-4"
                pressed={selectedColor === color}
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setSelectedColor(color);
                  }
                }}
              >
                {color}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-foreground">Size</legend>
          <ToggleGroup className="flex-wrap gap-2" aria-label="Size">
            {sizes.map((size) => (
              <ToggleGroupItem
                key={size}
                type="button"
                variant="outline"
                className="rounded-full px-4"
                pressed={selectedSize === size}
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setSelectedSize(size);
                  }
                }}
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
