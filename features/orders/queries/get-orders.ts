import "server-only";

import { apiFetch, type Paginated } from "@/lib/api/http";
import { handleAuthError } from "@/lib/api/handle-auth-error";
import type {
  OrderStatus,
  OrderSummary,
} from "@/features/orders/types/order";

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export async function getOrders(
  params: GetOrdersParams = {},
): Promise<Paginated<OrderSummary>> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();

  try {
    return await apiFetch<Paginated<OrderSummary>>(
      `/orders${query ? `?${query}` : ""}`,
      {
        auth: "required",
      },
    );
  } catch (error) {
    handleAuthError(error);
  }
}
