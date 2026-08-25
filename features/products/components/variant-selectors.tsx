"use client";

import { LucideLoader2, LucideShoppingBag } from "lucide-react";

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
import type { ProductSummary } from "@/features/products/types/product";
import { WishlistSaveButton } from "@/features/wishlist/components/wishlist-save-button";
import { SIZE_LADDER } from "@/lib/constants/size-ladder";

type VariantSelectorsProps = {
  product: ProductSummary;
  sizes: string[];
  colors: string[];
  quantity: number;
};

export function VariantSelectors({
  product,
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
  const missingRequiredVariant =
    (colors.length > 0 && !selectedColor) ||
    (sizes.length > 0 && !selectedSize);

  // The ladder is a display convention (GAP-9), not an enum -- the contract
  // defines no closed set of sizes. Rendering only the ladder would hide any
  // size outside it while the provider still defaults `selectedSize` to it,
  // leaving every visible button disabled and Add to bag posting an invisible
  // selection. So union: the ladder for its designed disabled states, plus
  // anything the product actually returns.
  const displayedSizes = [
    ...SIZE_LADDER,
    ...sizes.filter((size) => !(SIZE_LADDER as readonly string[]).includes(size)),
  ];

  function handleColorChange(next: string[]) {
    const nextColor = next.at(-1);

    if (nextColor) {
      setSelectedColor(nextColor);
    }
  }

  function handleSizeChange(next: string[]) {
    const nextSize = next.at(-1);

    if (nextSize && sizes.includes(nextSize)) {
      setSelectedSize(nextSize);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-eyebrow">
            Colour — {selectedColor}
          </legend>
          <ToggleGroup
            className="flex-wrap gap-2 overflow-visible rounded-none border-0"
            aria-label="Colour"
            value={selectedColor ? [selectedColor] : []}
            onValueChange={handleColorChange}
          >
            {colors.map((color) => (
              <ToggleGroupItem
                key={color}
                value={color}
                type="button"
                aria-label={color}
                title={color}
                // `outline-1` sets only the width; without an explicit
                // `outline-solid` the style stays `none` and the selected
                // swatch renders no ring at all.
                className="size-[26px] flex-none rounded-full border border-border p-0 shadow-none data-pressed:outline-solid data-pressed:outline-1 data-pressed:outline-accent data-pressed:outline-offset-2"
                style={{
                  backgroundColor: getColorSwatch(color) ?? "var(--muted)",
                }}
              />
            ))}
          </ToggleGroup>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset>
          {/* The design pairs this label with a "Size guide" link. There is no
              size-guide content or route, and a dead link is worse than none,
              so the label stands alone. */}
          <legend className="mb-2 text-eyebrow">Size</legend>
          {/* The design's `.seg` is an inline-flex that hugs its options; a
              full-width group stretches five sizes across the whole rail. */}
          <ToggleGroup
            className="w-fit"
            aria-label="Size"
            value={selectedSize ? [selectedSize] : []}
            onValueChange={handleSizeChange}
          >
            {displayedSizes.map((size) => {
              const isOffered = sizes.includes(size);

              return (
                <ToggleGroupItem
                  key={size}
                  value={size}
                  type="button"
                  disabled={!isOffered}
                  className="opacity-100 disabled:opacity-40"
                >
                  {size}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </fieldset>
      )}

      {variantRejected && (
        <p className="text-xs text-destructive" role="alert">
          That variant is unavailable. Choose another option.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-eyebrow">Quantity</span>
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

      <div data-product-purchase-actions>
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={addToCart}
          disabled={soldOut || isAdding || missingRequiredVariant}
        >
          {isAdding ? (
            <LucideLoader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <LucideShoppingBag data-icon="inline-start" />
          )}
          {soldOut ? "Sold out" : isAdding ? "Adding…" : "Add to bag"}
        </Button>
      </div>
      <WishlistSaveButton product={product} />
    </div>
  );
}
