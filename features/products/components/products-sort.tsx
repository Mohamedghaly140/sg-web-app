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
          /* The `h-auto` here is inert and always has been: the primitive's own
             `data-[size=default]:h-8` is an attribute selector and outranks a
             plain `h-auto` utility, so this trigger renders at the standard
             36.8px rather than collapsing to its line box. Measured in §13.7.
             It is left in place rather than removed because the padding resets
             beside it are doing the real work of making the control read as part
             of the "Sort: Newest" sentence, and this keeps the intent legible.
             It follows that this control takes the primitive's
             `pointer-coarse:min-h-10` touch floor like any other -- it was never
             the inline text run an opt-out would have been justified for. */
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
