import type { InteractiveActionError } from "@/lib/api/to-interactive-action-error";

export type CartProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceAfterDiscount: string;
  quantity: number;
  status: CartProductStatus;
};

export type CartItem = {
  id: string;
  product: CartProduct;
  quantity: number;
  color: string | null;
  size: string | null;
  price: string;
  lineTotal: string;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  totalCartPrice: string;
  totalPriceAfterDiscount: string;
  expiresAt: string | null;
};

export type CartTransport = Cart & { sessionToken?: string };

export const EMPTY_CART: Cart = {
  id: null,
  items: [],
  totalCartPrice: "0.00",
  totalPriceAfterDiscount: "0.00",
  expiresAt: null,
};

export type CartActionResult = Cart | InteractiveActionError;
