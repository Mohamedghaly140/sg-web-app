import "server-only";
import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "sg_cart_session";
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function getCartSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value;
}

export async function setCartSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_SESSION_MAX_AGE,
  });
}

export async function clearCartSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_SESSION_COOKIE);
}
