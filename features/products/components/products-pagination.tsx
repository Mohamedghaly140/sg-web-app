import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ProductsSearchParams } from "@/features/products/hooks/products-search-params";
import type { PageMeta } from "@/lib/api/http";

type ProductsPaginationProps = {
  searchParams: ProductsSearchParams;
  meta: PageMeta;
};

export function buildProductsHref(
  searchParams: ProductsSearchParams,
  page: number,
): string {
  const query = new URLSearchParams();

  if (searchParams.search !== null) query.set("search", searchParams.search);
  if (searchParams.category !== null) query.set("category", searchParams.category);
  if (searchParams.subCategory !== null) {
    query.set("subCategory", searchParams.subCategory);
  }
  if (searchParams.minPrice !== null) {
    query.set("minPrice", String(searchParams.minPrice));
  }
  if (searchParams.maxPrice !== null) {
    query.set("maxPrice", String(searchParams.maxPrice));
  }
  if (searchParams.sizes !== null) query.set("sizes", searchParams.sizes);
  if (searchParams.colors !== null) query.set("colors", searchParams.colors);
  if (searchParams.featured !== null) {
    query.set("featured", String(searchParams.featured));
  }
  query.set("sort", searchParams.sort);
  query.set("limit", String(searchParams.limit));
  query.set("page", String(page));

  return `/products?${query.toString()}`;
}

function getPageWindow(current: number, totalPages: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function ProductsPagination({ searchParams, meta }: ProductsPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(meta.page, meta.totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildProductsHref(searchParams, meta.page - 1)}
            aria-disabled={!meta.hasPrev}
            className={!meta.hasPrev ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={buildProductsHref(searchParams, page)}
              isActive={page === meta.page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={buildProductsHref(searchParams, meta.page + 1)}
            aria-disabled={!meta.hasNext}
            className={!meta.hasNext ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
