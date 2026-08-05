import { NextResponse } from "next/server";

import type { Cart, CartTransport } from "@/features/cart/types/cart";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";
import { captureAndSanitizeCart } from "@/lib/cart-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transport = await apiFetch<CartTransport>("/cart", {
      auth: "optional",
      cartSession: true,
    });
    const cart = await captureAndSanitizeCart<Cart>(transport);

    return NextResponse.json(cart, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const status =
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 502;

      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            errors: error.errors,
          },
        },
        {
          status,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    console.error("Unable to load the cart.", error);

    return NextResponse.json(
      { error: { code: "UNKNOWN", message: "Unable to load the cart." } },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
