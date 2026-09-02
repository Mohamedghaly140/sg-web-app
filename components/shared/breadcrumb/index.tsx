import { Fragment } from "react";
import { LucideChevronLeft } from "lucide-react";
import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /**
   * Overrides the narrow-width back link, which otherwise points at the last
   * linked crumb. The product detail page needs it: its documented collapse is
   * "← Dresses" to `/categories/[slug]` (docs/screens/product-detail.md
   * §"Narrow width"), not to the subcategory crumb that follows the category.
   */
  back?: BreadcrumbItem & { href: string };
};

export function Breadcrumb({ items, back }: BreadcrumbProps) {
  const backItem = back ?? items.findLast((item) => item.href !== undefined);

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-border py-3 text-xs text-muted-foreground"
    >
      {/* Narrow width collapses to the last available parent link. */}
      {backItem?.href ? (
        <Link
          href={backItem.href}
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground sm:hidden"
        >
          <LucideChevronLeft className="size-3.5" aria-hidden />
          {backItem.label}
        </Link>
      ) : null}

      <ol className="hidden flex-wrap items-center gap-2 sm:flex">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? <li aria-hidden="true">·</li> : null}
              <li
                className={isCurrent ? "text-foreground" : undefined}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.href && !isCurrent ? (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
