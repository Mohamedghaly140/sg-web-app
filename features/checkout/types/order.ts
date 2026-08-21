export type OrderItem = {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  color: string | null;
  size: string | null;
  price: string;
  lineTotal: string;
};

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderDetail = {
  id: string;
  humanOrderId: string;
  status: OrderStatus;
  paymentMethod: "CASH" | "CARD";
  items: OrderItem[];
  itemsSubtotal: string;
  discountApplied: string;
  shippingFees: string;
  totalOrderPrice: string;
  isPaid: boolean;
  createdAt: string;
};

// The real claim token is never returned by the API — `claimToken` is always
// this literal marker (docs/integration/storefront/09-checkout.md §guest).
export type GuestOrderDetail = OrderDetail & { claimToken: "sent-by-email" };
