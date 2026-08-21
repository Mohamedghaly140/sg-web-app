import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { OrdersSearchParams } from "@/features/orders/hooks/orders-search-params";
import type { OrderStatus } from "@/features/orders/types/order";
import type { PageMeta } from "@/lib/api/http";

type OrdersPaginationProps = {
  searchParams: OrdersSearchParams;
  meta: PageMeta;
};

export function buildOrdersHref(
  searchParams: OrdersSearchParams,
  overrides?: { page?: number; status?: OrderStatus | null },
): string {
  const query = new URLSearchParams();

  const page = overrides?.page ?? searchParams.page;
  const status =
    overrides?.status !== undefined ? overrides.status : searchParams.status;

  if (status !== null) {
    query.set("status", status);
  }
  query.set("limit", String(searchParams.limit));
  query.set("page", String(page));

  return `/account/orders?${query.toString()}`;
}

function getPageWindow(current: number, totalPages: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function OrdersPagination({ searchParams, meta }: OrdersPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(meta.page, meta.totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            {...(meta.hasPrev
              ? { href: buildOrdersHref(searchParams, { page: meta.page - 1 }) }
              : {})}
            aria-disabled={!meta.hasPrev}
            className={!meta.hasPrev ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={buildOrdersHref(searchParams, { page })}
              isActive={page === meta.page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            {...(meta.hasNext
              ? { href: buildOrdersHref(searchParams, { page: meta.page + 1 }) }
              : {})}
            aria-disabled={!meta.hasNext}
            className={!meta.hasNext ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
