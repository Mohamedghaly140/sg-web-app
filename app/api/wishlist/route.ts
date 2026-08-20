import { NextResponse } from "next/server";

import type { Wishlist } from "@/features/wishlist/types/wishlist";
import { ApiError } from "@/lib/api/api-error";
import { apiFetch } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const wishlist = await apiFetch<Wishlist>("/wishlist", {
      auth: "required",
    });

    return NextResponse.json(wishlist, {
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

    console.error("Unable to load the wishlist.", error);

    return NextResponse.json(
      {
        error: {
          code: "UNKNOWN",
          message: "Unable to load the wishlist.",
        },
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
