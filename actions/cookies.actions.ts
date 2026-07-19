"use server";

import "server-only";
import { cookies } from "next/headers";

export async function setCookieByKey(
  key: string,
  value: string,
): Promise<void> {
  (await cookies()).set(key, value);
}

const TOAST_COOKIE_KEY = "toast";

// No-argument, toast-scoped: RedirectToast is a Client Component, so any
// exported "use server" function it imports becomes a publicly callable
// endpoint. A generic get/delete-by-key action would let same-origin script
// read or clear arbitrary cookies, including the HttpOnly cart session.
export async function getAndClearToastCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const message = cookieStore.get(TOAST_COOKIE_KEY)?.value;
  if (message !== undefined) {
    cookieStore.delete(TOAST_COOKIE_KEY);
  }
  return message;
}
