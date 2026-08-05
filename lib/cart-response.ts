import "server-only";

import { auth } from "@clerk/nextjs/server";

import { setCartSession } from "@/lib/cart-session";

export function sanitizeCartResponse<TCart>(
  transport: TCart & { sessionToken?: string },
): TCart {
  const { sessionToken, ...cart } = transport;
  void sessionToken;
  return cart as TCart;
}

/**
 * Captures or refreshes the anonymous cart cookie before stripping transport
 * identity from a writable response. Deletion events take precedence over
 * refresh and are handled by their own call sites. Phase 5's
 * `POST /coupons/validate` action is the fifth cart-aware caller and must reuse
 * this helper and cookie rather than introducing a second client path.
 */
export async function captureRefreshAndSanitizeCart<TCart>(
  transport: TCart & { sessionToken?: string },
  existingSession: string | undefined,
): Promise<TCart> {
  if (transport.sessionToken) {
    await setCartSession(transport.sessionToken);
  } else {
    const { userId } = await auth();
    if (userId == null && existingSession) {
      await setCartSession(existingSession);
    }
  }

  return sanitizeCartResponse(transport);
}

/**
 * Handles cart reads in cookie-write-capable contexts such as
 * `app/api/cart/route.ts`. Lifecycle rule 3 limits the seven-day `maxAge`
 * refresh to successful anonymous mutations; refreshing on a read would slide
 * the cookie on every window-focus refetch and make an idle open tab's guest
 * cart effectively immortal. Deliberately omitting an `existingSession`
 * parameter makes that refresh misuse structurally impossible.
 */
export async function captureAndSanitizeCart<TCart>(
  transport: TCart & { sessionToken?: string },
): Promise<TCart> {
  if (transport.sessionToken) {
    await setCartSession(transport.sessionToken);
  }

  return sanitizeCartResponse(transport);
}
