"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProductsParams,
  type ProductsSearchParams,
} from "@/features/products/hooks/use-products-params";

const SORT_OPTIONS: { value: ProductsSearchParams["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "best_selling", label: "Best selling" },
  { value: "top_rated", label: "Top rated" },
];

/* Sort sits outside the filter drawer in the design, so unlike the drawer's
   deferred draft it commits immediately. Its value is 13px, below the 24px
   floor for `text-accent` (docs/01-conventions.md §7), so it takes
   `text-accent-strong`; the chevron is an icon and may stay `text-accent`. */
export function ProductsSort() {
  const [params, setParams] = useProductsParams();

  function handleSortChange(value: ProductsSearchParams["sort"] | null) {
    if (value === null) return;
    void setParams({ sort: value, page: 1 });
  }

  return (
    <span className="flex items-baseline gap-1 text-[13px] text-foreground">
      <span>Sort:</span>
      <Select value={params.sort} onValueChange={handleSortChange}>
        <SelectTrigger
          aria-label="Sort products"
          className="h-auto border-transparent px-0 py-0 text-[13px] text-accent-strong hover:border-transparent focus-visible:border-transparent [&_svg]:text-accent"
        >
          {/* Base UI renders the raw item value unless given a formatter, which
              would surface "top_rated" in the UI. */}
          <SelectValue>
            {(value: ProductsSearchParams["sort"] | null) =>
              SORT_OPTIONS.find((option) => option.value === value)?.label ??
              "Newest"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </span>
  );
}
