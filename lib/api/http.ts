import "server-only";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";
import { ApiError } from "./api-error";

export type PageMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ApiFetchInit = Omit<RequestInit, "body" | "cache"> & {
  body?: unknown;
};

type ApiEnvelope<TData> =
  | { status: "success"; message: string; data: TData; meta?: PageMeta }
  | { status: "error"; message: string; code: string; errors?: { field: string; message: string }[] };

export async function apiFetch<TData = undefined>(
  path: string,
  init: ApiFetchInit = {},
): Promise<{ data: TData; meta?: PageMeta }> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    throw new ApiError(401, "UNAUTHENTICATED", "No active session");
  }

  const { body, headers, ...rest } = init;

  const res = await fetch(`${env.API_URL}/api/v1${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) {
    return { data: undefined as TData };
  }

  const json: ApiEnvelope<TData> = await res.json();

  if (json.status !== "success") {
    throw new ApiError(res.status, json.code, json.message, json.errors);
  }

  return { data: json.data, meta: json.meta };
}
