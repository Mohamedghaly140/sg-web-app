import "server-only";

import { apiFetch } from "@/lib/api/http";
import { handleAuthError } from "@/lib/api/handle-auth-error";
import { redirectOnAuthError } from "@/lib/api/redirect-on-auth-error";
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

/**
 * Best-effort line snapshot used only to enrich one already-rendered order card
 * (the GAP-15 fallback in `docs/backend-contract-gaps.md`). Unlike `getOrder`,
 * a failure here must not take down a list that loaded fine, so recoverable
 * errors degrade to `null` and the card renders summary-only. Auth failures are
 * still authoritative: `redirectOnAuthError` throws before anything is
 * swallowed.
 */
export async function getOrderPreview(id: string): Promise<OrderDetail | null> {
  try {
    return await apiFetch<OrderDetail>(`/orders/${encodeURIComponent(id)}`, {
      auth: "required",
    });
  } catch (error) {
    redirectOnAuthError(error, "required");
    return null;
  }
}
