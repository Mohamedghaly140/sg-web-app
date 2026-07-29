"use client";

import { useState } from "react";
import { LucideMinus, LucidePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
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
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes[0],
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colors[0],
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const soldOut = quantity <= 0;

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

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center border border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Decrease quantity"
            disabled={soldOut || selectedQuantity <= 1}
            onClick={() =>
              setSelectedQuantity((current) => Math.max(1, current - 1))
            }
          >
            <LucideMinus data-icon="inline-start" />
          </Button>
          <output
            className="min-w-8 text-center text-sm tabular-nums"
            aria-live="polite"
          >
            {selectedQuantity}
          </output>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Increase quantity"
            disabled={soldOut || selectedQuantity >= quantity}
            onClick={() =>
              setSelectedQuantity((current) =>
                Math.min(quantity, current + 1),
              )
            }
          >
            <LucidePlus data-icon="inline-start" />
          </Button>
        </div>
        <StockBadge quantity={quantity} />
      </div>

      <div className="flex flex-col gap-2">
        <div
          className="grid grid-cols-2 gap-2"
          data-product-purchase-actions
        >
          <Button type="button" disabled>
            {soldOut ? "Sold out" : "Add to Cart"}
          </Button>
          <Button type="button" variant="outline" disabled>
            Buy Now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cart and checkout are coming soon.
        </p>
      </div>
    </div>
  );
}
