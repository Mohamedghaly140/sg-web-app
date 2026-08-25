import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  buildProductsHref,
  type ProductsSearchParams,
} from "@/features/products/hooks/products-search-params";
import type { PageMeta } from "@/lib/api/http";

type ProductsPaginationProps = {
  searchParams: ProductsSearchParams;
  meta: PageMeta;
};

type PaginationStepProps = {
  label: string;
  href: string;
  enabled: boolean;
};

/* A disabled step is a real `<button disabled>`, not an anchor neutralised with
   `pointer-events-none`: a disabled anchor still takes focus and still reads as
   a link to assistive tech. Button's `disabled:opacity-45` already matches the
   design's 45%. */
function PaginationStep({ label, href, enabled }: PaginationStepProps) {
  if (!enabled) {
    return (
      <Button variant="secondary" disabled>
        {label}
      </Button>
    );
  }

  return (
    <Button variant="secondary" render={<Link href={href} />} nativeButton={false}>
      {label}
    </Button>
  );
}

export function ProductsPagination({
  searchParams,
  meta,
}: ProductsPaginationProps) {
  // Always rendered -- the design shows "Page 1 of 1" with both steps disabled,
  // so a single-page result keeps its footer rather than losing it.
  const totalPages = Math.max(1, meta.totalPages);

  return (
    <div className="figures mt-6 flex items-center justify-center gap-2 text-[13px]">
      <PaginationStep
        label="Previous"
        href={buildProductsHref(searchParams, { page: meta.page - 1 })}
        enabled={meta.hasPrev}
      />
      <span className="text-muted-foreground">
        Page {meta.page} of {totalPages}
      </span>
      <PaginationStep
        label="Next"
        href={buildProductsHref(searchParams, { page: meta.page + 1 })}
        enabled={meta.hasNext}
      />
    </div>
  );
}
