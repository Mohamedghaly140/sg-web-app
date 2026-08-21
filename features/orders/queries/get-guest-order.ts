import "server-only";

import { notFound } from "next/navigation";

import type { OrderDetail } from "@/features/checkout/types/order";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

export type GuestOrderResult =
  | { status: "ok"; order: OrderDetail }
  | { status: "rate_limited" };

export async function getGuestOrder(token: string): Promise<GuestOrderResult> {
  try {
    const order = await apiFetch<OrderDetail>(
      `/orders/guest/${encodeURIComponent(token)}`,
      { auth: "public" },
    );
    return { status: "ok", order };
  } catch (error) {
    if (error instanceof ApiError && error.code === "CLAIM_TOKEN_INVALID") {
      notFound();
    }
    if (error instanceof ApiError && error.code === "RATE_LIMITED") {
      return { status: "rate_limited" };
    }
    throw error;
  }
}
