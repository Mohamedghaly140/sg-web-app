import "server-only";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { getCartSession } from "@/lib/cart-session";
import { ApiError } from "./api-error";

export type ApiAuthMode = "public" | "optional" | "required";

export type PageMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<TItem> = {
  data: TItem[];
  meta: PageMeta;
};

export type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: ApiAuthMode;
  cartSession?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
  headers?: HeadersInit;
};

type ApiEnvelope =
  | { status: "success"; message: string; data: unknown; meta?: PageMeta }
  | { status: "error"; message: string; code: string; errors?: unknown };

export async function apiFetch<T = undefined>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const mode: ApiAuthMode = options.auth ?? "public";
  const usesCartSession = options.cartSession ?? false;

  if (process.env.NODE_ENV !== "production") {
    const requestsCacheMetadata =
      options.cache !== undefined || options.next !== undefined;
    const isCacheEligible = mode === "public" && !usesCartSession;
    if (requestsCacheMetadata && !isCacheEligible) {
      throw new Error(
        `apiFetch: cache metadata is only allowed for public, non-cart-aware requests (path: ${path})`,
      );
    }
  }

  const headers = new Headers(options.headers);
  if (headers.has("Authorization") || headers.has("X-Cart-Session")) {
    throw new Error(
      `apiFetch: callers must not set reserved identity headers directly (path: ${path})`,
    );
  }

  if (mode !== "public") {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (usesCartSession) {
    const cartSessionToken = await getCartSession();
    if (cartSessionToken) {
      headers.set("X-Cart-Session", cartSessionToken);
    }
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const cacheInit: Pick<RequestInit, "cache"> & {
    next?: ApiFetchOptions["next"];
  } = {};
  if (options.next !== undefined) {
    cacheInit.next = options.next;
    if (options.cache !== undefined) {
      cacheInit.cache = options.cache;
    }
  } else {
    cacheInit.cache = options.cache ?? "no-store";
  }

  const res = await fetch(`${env.API_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    ...cacheInit,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  let json: ApiEnvelope;
  try {
    json = (await res.json()) as ApiEnvelope;
  } catch {
    throw new ApiError(res.status, "UNKNOWN", res.statusText || "Unknown error");
  }

  if (json.status !== "success") {
    throw new ApiError(res.status, json.code, json.message, json.errors);
  }

  if (json.meta !== undefined) {
    return { data: json.data, meta: json.meta } as T;
  }

  return json.data as T;
}
