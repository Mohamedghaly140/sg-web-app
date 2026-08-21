import "server-only";

import { apiFetch } from "@/lib/api/http";
import { handleAuthError } from "@/lib/api/handle-auth-error";
import type { OrderDetail } from "@/features/checkout/types/order";

export async function getOrder(id: string): Promise<OrderDetail> {
  try {
    return await apiFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}`, {
      auth: "required",
    });
  } catch (error) {
    handleAuthError(error);
  }
}
