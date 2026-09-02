import type { Cart } from "@/features/cart/types/cart";
import type { InteractiveActionError } from "@/lib/api/to-interactive-action-error";

export type BuyAgainSkippedItem = {
  productId: string;
  code: string;
  available?: number;
};

export type BuyAgainResult =
  | {
      cart: Cart;
      /** Order lines re-added, not units — a line of quantity 5 counts once. */
      added: number;
      /** Total lines on the order, so a partial result can be stated honestly. */
      total: number;
      /** Lines the backend refused as genuinely unavailable. */
      skipped: BuyAgainSkippedItem[];
      /**
       * Set when the re-add stopped early on a real failure (429, 5xx, network)
       * rather than an unavailable line. The cart is still authoritative for
       * whatever landed before it; lines after this point were never attempted
       * and must not be reported as unavailable.
       */
      failure?: InteractiveActionError["error"];
    }
  | InteractiveActionError;
