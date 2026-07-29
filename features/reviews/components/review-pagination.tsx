import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/api/http";

type ReviewPaginationProps = {
  meta: PageMeta;
};

export function ReviewPagination({ meta }: ReviewPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Review pagination"
    >
      {meta.hasPrev ? (
        <Button
          variant="outline"
          size="icon-sm"
          render={
            <Link
              href={`?page=${meta.page - 1}&limit=${meta.limit}`}
              aria-label="Previous page"
            />
          }
        >
          <LucideChevronLeft aria-hidden />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled
        >
          <LucideChevronLeft aria-hidden />
        </Button>
      )}
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.totalPages}
      </p>
      {meta.hasNext ? (
        <Button
          variant="outline"
          size="icon-sm"
          render={
            <Link
              href={`?page=${meta.page + 1}&limit=${meta.limit}`}
              aria-label="Next page"
            />
          }
        >
          <LucideChevronRight aria-hidden />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled
        >
          <LucideChevronRight aria-hidden />
        </Button>
      )}
    </nav>
  );
}
