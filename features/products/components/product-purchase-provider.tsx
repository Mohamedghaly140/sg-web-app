"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import {
  useCartErrorState,
  type CartErrorView,
} from "@/features/cart/hooks/use-cart-error-state";
import type { AddCartItemInput } from "@/features/cart/schema/add-cart-item-schema";

type ProductPurchaseContextValue = {
  productId: string;
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
  selectedSize: string | undefined;
  setSelectedSize: (size: string | undefined) => void;
  selectedQuantity: number;
  setSelectedQuantity: (quantity: number) => void;
  error: CartErrorView | undefined;
  isAdding: boolean;
  isProductUnavailable: boolean;
  addToCart: () => void;
};

const ProductPurchaseContext = createContext<
  ProductPurchaseContextValue | undefined
>(undefined);

export type ProductPurchaseProviderProps = {
  productId: string;
  sizes: string[];
  colors: string[];
  quantity: number;
  children: ReactNode;
};

export function ProductPurchaseProvider({
  productId,
  sizes,
  colors,
  quantity,
  children,
}: ProductPurchaseProviderProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColorState] = useState<
    string | undefined
  >(colors[0]);
  const [selectedSize, setSelectedSizeState] = useState<string | undefined>(
    sizes[0],
  );
  const [selectedQuantity, setSelectedQuantityState] = useState(1);
  const [requiresVariantReselection, setRequiresVariantReselection] =
    useState(false);
  const [isProductUnavailable, setIsProductUnavailable] = useState(false);
  const { getError, setError, clearError } = useCartErrorState();

  const addItem = useAddCartItem({
    onSuccess: (result) => {
      if ("error" in result) {
        setError(productId, result.error);

        switch (result.error.code) {
          case "INSUFFICIENT_STOCK":
            return;
          case "INVALID_VARIANT":
            setRequiresVariantReselection(true);
            router.refresh();
            return;
          case "RESOURCE_NOT_FOUND":
            setIsProductUnavailable(true);
            toast.error(result.error.message);
            return;
          case "RATE_LIMITED":
            toast.error(result.error.message);
            return;
          default:
            toast.error(result.error.message);
            return;
        }
      }

      clearError(productId);
      toast.success("Added to your cart");
    },
  });

  const setSelectedColor = useCallback(
    (color: string | undefined) => {
      if (color === selectedColor) {
        return;
      }

      setSelectedColorState(color);
      setRequiresVariantReselection(false);
      clearError(productId);
    },
    [clearError, productId, selectedColor],
  );

  const setSelectedSize = useCallback(
    (size: string | undefined) => {
      if (size === selectedSize) {
        return;
      }

      setSelectedSizeState(size);
      setRequiresVariantReselection(false);
      clearError(productId);
    },
    [clearError, productId, selectedSize],
  );

  const setSelectedQuantity = useCallback(
    (nextQuantity: number) => {
      if (nextQuantity === selectedQuantity) {
        return;
      }

      setSelectedQuantityState(nextQuantity);
      if (getError(productId)?.code === "INSUFFICIENT_STOCK") {
        clearError(productId);
      }
    },
    [clearError, getError, productId, selectedQuantity],
  );

  const addToCart = useCallback(() => {
    if (isProductUnavailable || quantity < 1) {
      return;
    }

    if (requiresVariantReselection) {
      toast.error("Choose an available variant before adding again.");
      return;
    }

    if (colors.length > 0 && !selectedColor) {
      toast.error("Choose a color before adding to your cart.");
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.error("Choose a size before adding to your cart.");
      return;
    }

    if (!Number.isInteger(selectedQuantity) || selectedQuantity < 1) {
      toast.error("Choose a valid quantity before adding to your cart.");
      return;
    }

    const input: AddCartItemInput = {
      productId,
      quantity: selectedQuantity,
    };

    if (selectedColor) {
      input.color = selectedColor;
    }
    if (selectedSize) {
      input.size = selectedSize;
    }

    addItem.mutate(input);
  }, [
    addItem,
    colors.length,
    isProductUnavailable,
    productId,
    quantity,
    requiresVariantReselection,
    selectedColor,
    selectedQuantity,
    selectedSize,
    sizes.length,
  ]);

  const value = useMemo<ProductPurchaseContextValue>(
    () => ({
      productId,
      selectedColor,
      setSelectedColor,
      selectedSize,
      setSelectedSize,
      selectedQuantity,
      setSelectedQuantity,
      error: getError(productId),
      isAdding: addItem.isPending,
      isProductUnavailable,
      addToCart,
    }),
    [
      addItem.isPending,
      addToCart,
      getError,
      isProductUnavailable,
      productId,
      selectedColor,
      selectedQuantity,
      selectedSize,
      setSelectedColor,
      setSelectedQuantity,
      setSelectedSize,
    ],
  );

  return (
    <ProductPurchaseContext.Provider value={value}>
      {children}
    </ProductPurchaseContext.Provider>
  );
}

export function useProductPurchase(): ProductPurchaseContextValue {
  const context = useContext(ProductPurchaseContext);

  if (!context) {
    throw new Error(
      "useProductPurchase must be used within ProductPurchaseProvider",
    );
  }

  return context;
}
