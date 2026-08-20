import type { ProductSummary } from "@/features/products/types/product";
import type { InteractiveActionError } from "@/lib/api/to-interactive-action-error";

export type WishlistEntry = {
  product: ProductSummary;
  addedAt: string;
  available: boolean;
};

export type Wishlist = WishlistEntry[];

export type AddToWishlistResult = { added: true } | InteractiveActionError;

export type RemoveFromWishlistResult =
  | { removed: true }
  | InteractiveActionError;
