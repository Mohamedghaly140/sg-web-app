import "server-only";

import { redirect } from "next/navigation";

import type { PageMeta } from "@/lib/api/http";

export function redirectToLastPageIfOutOfRange(
  meta: PageMeta | undefined,
  toHref: (page: number) => string,
): void {
  if (meta && meta.totalItems > 0 && meta.page > meta.totalPages) {
    redirect(toHref(meta.totalPages));
  }
}
