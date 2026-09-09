"use client";

import * as React from "react";
import { catchError } from "next/error";

import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/features/categories/types/category";
import {
  useProductsParams,
  type ProductsSearchParams,
} from "@/features/products/hooks/use-products-params";
import { SIZE_LADDER } from "@/lib/constants/size-ladder";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = ["Black", "White", "Emerald", "Navy", "Blush"];

type ProductsFiltersProps = {
  categories: Category[];
  /** Resolves to meta.totalItems for the CURRENTLY APPLIED filters.
      Consume with use() inside a Suspense in the drawer footer only. */
  appliedCountPromise: Promise<number>;
};

type ProductsFilterDraft = {
  category: string | null;
  subCategory: string | null;
  sizes: string | null;
  colors: string | null;
  minPrice: string;
  maxPrice: string;
};

type AppliedCountLabelProps = {
  appliedCountPromise: Promise<number>;
};

const EMPTY_FILTER_DRAFT: ProductsFilterDraft = {
  category: null,
  subCategory: null,
  sizes: null,
  colors: null,
  minPrice: "",
  maxPrice: "",
};

function getCsvItems(value: string | null): string[] {
  if (value === null) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function toggleCsvItem(value: string | null, item: string): string | null {
  const items = getCsvItems(value);
  const nextItems = items.includes(item)
    ? items.filter((currentItem) => currentItem !== item)
    : [...items, item];

  return nextItems.length > 0 ? nextItems.join(",") : null;
}

function createDraft(params: ProductsSearchParams): ProductsFilterDraft {
  return {
    category: params.category,
    subCategory: params.subCategory,
    sizes: params.sizes,
    colors: params.colors,
    minPrice: params.minPrice === null ? "" : String(params.minPrice),
    maxPrice: params.maxPrice === null ? "" : String(params.maxPrice),
  };
}

function areDraftsEqual(
  first: ProductsFilterDraft,
  second: ProductsFilterDraft,
): boolean {
  return (
    first.category === second.category &&
    first.subCategory === second.subCategory &&
    first.sizes === second.sizes &&
    first.colors === second.colors &&
    first.minPrice === second.minPrice &&
    first.maxPrice === second.maxPrice
  );
}

function normalizePrice(value: string): number | null {
  if (value.trim().length === 0) return null;

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function countActiveFilters(params: ProductsSearchParams): number {
  return (
    (params.subCategory === null ? 0 : 1) +
    getCsvItems(params.sizes).length +
    getCsvItems(params.colors).length +
    (params.featured === true ? 1 : 0) +
    (params.minPrice === null && params.maxPrice === null ? 0 : 1)
  );
}

function AppliedCountLabel({
  appliedCountPromise,
}: AppliedCountLabelProps): React.JSX.Element {
  const appliedCount = React.use(appliedCountPromise);

  return (
    <>
      Show <span className="figures">{appliedCount}</span> pieces
    </>
  );
}

function AppliedCountErrorFallback(): React.JSX.Element {
  return <>Show results</>;
}

const AppliedCountErrorBoundary = catchError(AppliedCountErrorFallback);

export function ProductsFilters({
  categories,
  appliedCountPromise,
}: ProductsFiltersProps): React.JSX.Element {
  const [params, setParams] = useProductsParams();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ProductsFilterDraft>(() =>
    createDraft(params),
  );
  const selectedCategory = categories.find(
    (category) => category.slug === draft.category,
  );
  const selectedSizes = getCsvItems(draft.sizes);
  const selectedColors = getCsvItems(draft.colors);
  const activeFilterCount = countActiveFilters(params);
  const draftMatchesApplied = areDraftsEqual(draft, createDraft(params));

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      setDraft(createDraft(params));
    }
    setOpen(nextOpen);
  }

  function handleCategoryChange(value: string): void {
    const category = value === "all" ? null : value;

    setDraft((currentDraft) => ({
      ...currentDraft,
      category,
      subCategory:
        category === currentDraft.category ? currentDraft.subCategory : null,
    }));
  }

  function handleSubCategoryChange(value: string): void {
    setDraft((currentDraft) => ({
      ...currentDraft,
      subCategory: value === "all" ? null : value,
    }));
  }

  function handleSizeToggle(size: string): void {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sizes: toggleCsvItem(currentDraft.sizes, size),
    }));
  }

  function handleColorToggle(color: string): void {
    setDraft((currentDraft) => ({
      ...currentDraft,
      colors: toggleCsvItem(currentDraft.colors, color),
    }));
  }

  function handleMinPriceChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setDraft((currentDraft) => ({
      ...currentDraft,
      minPrice: event.target.value,
    }));
  }

  function handleMaxPriceChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setDraft((currentDraft) => ({
      ...currentDraft,
      maxPrice: event.target.value,
    }));
  }

  function handleClear(): void {
    setDraft(EMPTY_FILTER_DRAFT);
  }

  function handleShowResults(): void {
    void setParams({
      category: draft.category,
      subCategory: draft.subCategory,
      sizes: draft.sizes,
      colors: draft.colors,
      minPrice: normalizePrice(draft.minPrice),
      maxPrice: normalizePrice(draft.maxPrice),
      page: 1,
    });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button />}>
        Filter (<span className="figures">{activeFilterCount}</span>)
      </SheetTrigger>
      {/* One Sheet, two presentations. `side="bottom"` is the BASE case, not a
          fallback: a 340px side panel is 94% of a 360px viewport, so below `sm`
          the drawer rises from the bottom, and the `sm:` overrides restore S2's
          designed 340px left rail.

          The side must be flipped rather than overridden in CSS. The primitive
          writes the rail as `data-[side=left]:…` attribute selectors, which win
          on specificity over unprefixed call-site classes AND sit in a
          different tailwind-merge group, so a "bottom sheet below sm" written
          against `side="left"` would silently never apply while the horizontal
          enter/exit transform kept firing. Every override below therefore
          carries the same `data-[side=bottom]:` prefix as the class it
          replaces, and every one is a `sm:` min-width rule, so it is emitted
          after the base declaration and wins on source order. */}
      <SheetContent
        side="bottom"
        overlayClassName="bg-background/55 supports-backdrop-filter:backdrop-blur-none"
        className="gap-4 rounded-t-lg border-border bg-background p-4 data-[side=bottom]:max-h-[85svh] sm:rounded-none sm:p-6 data-[side=bottom]:sm:inset-x-auto data-[side=bottom]:sm:inset-y-0 data-[side=bottom]:sm:left-0 data-[side=bottom]:sm:h-full data-[side=bottom]:sm:max-h-none data-[side=bottom]:sm:w-[340px] data-[side=bottom]:sm:border-t-0 data-[side=bottom]:sm:border-r data-[side=bottom]:sm:data-ending-style:translate-x-[-2.5rem] data-[side=bottom]:sm:data-ending-style:translate-y-0 data-[side=bottom]:sm:data-starting-style:translate-x-[-2.5rem] data-[side=bottom]:sm:data-starting-style:translate-y-0"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="font-normal">Refine</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
          <fieldset>
            <legend className="text-eyebrow mb-2">Category</legend>
            <RadioGroup
              value={draft.category ?? "all"}
              onValueChange={handleCategoryChange}
              className="flex flex-col gap-[7px] text-sm"
            >
              <label
                className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-10"
                htmlFor="filter-category-all"
              >
                <RadioGroupItem id="filter-category-all" value="all" />
                <span>All categories</span>
              </label>
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-10"
                  htmlFor={`filter-category-${category.id}`}
                >
                  <RadioGroupItem
                    id={`filter-category-${category.id}`}
                    value={category.slug}
                  />
                  <span>
                    {category.name} (
                    <span className="figures">{category.productCount}</span>)
                  </span>
                </label>
              ))}
            </RadioGroup>

            {selectedCategory !== undefined && (
              <RadioGroup
                value={draft.subCategory ?? "all"}
                onValueChange={handleSubCategoryChange}
                aria-label={`${selectedCategory.name} sub-category`}
                className="mt-2 flex flex-col gap-[7px] pl-4 text-sm"
              >
                <label
                  className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-10"
                  htmlFor={`filter-sub-category-all-${selectedCategory.id}`}
                >
                  <RadioGroupItem
                    id={`filter-sub-category-all-${selectedCategory.id}`}
                    value="all"
                  />
                  <span>All</span>
                </label>
                {selectedCategory.subCategories.map((subCategory) => (
                  <label
                    key={subCategory.id}
                    className="flex cursor-pointer items-center gap-2 pointer-coarse:min-h-10"
                    htmlFor={`filter-sub-category-${subCategory.id}`}
                  >
                    <RadioGroupItem
                      id={`filter-sub-category-${subCategory.id}`}
                      value={subCategory.slug}
                    />
                    <span>
                      {subCategory.name} (
                      <span className="figures">
                        {subCategory.productCount}
                      </span>
                      )
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          </fieldset>

          <Separator />

          <fieldset>
            <legend className="text-eyebrow mb-2">Size</legend>
            <div className="flex flex-wrap gap-[6px]">
              {SIZE_LADDER.map((size) => {
                const selected = selectedSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      badgeVariants({
                        variant: selected ? "outline" : "secondary",
                      }),
                      "cursor-pointer pointer-coarse:min-h-10 pointer-coarse:px-4",
                    )}
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Separator />

          <fieldset>
            <legend className="text-eyebrow mb-2">Colour</legend>
            <div className="flex flex-wrap gap-[6px]">
              {COLOR_OPTIONS.map((color) => {
                const selected = selectedColors.includes(color);

                return (
                  <button
                    key={color}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      badgeVariants({
                        variant: selected ? "outline" : "secondary",
                      }),
                      "cursor-pointer pointer-coarse:min-h-10 pointer-coarse:px-4",
                    )}
                    onClick={() => handleColorToggle(color)}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Separator />

          <fieldset>
            <legend className="text-eyebrow mb-2">Price</legend>
            <div className="flex items-center gap-2">
              <Input
                className="figures"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                aria-label="Minimum price"
                placeholder="Min"
                value={draft.minPrice}
                onChange={handleMinPriceChange}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                className="figures"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                aria-label="Maximum price"
                placeholder="Max"
                value={draft.maxPrice}
                onChange={handleMaxPriceChange}
              />
            </div>
          </fieldset>
        </div>

        <SheetFooter className="mt-auto flex-row gap-2 p-0">
          <Button variant="secondary" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
          <Button className="flex-2" onClick={handleShowResults}>
            {draftMatchesApplied ? (
              <AppliedCountErrorBoundary>
                <React.Suspense fallback="Show results">
                  <AppliedCountLabel
                    appliedCountPromise={appliedCountPromise}
                  />
                </React.Suspense>
              </AppliedCountErrorBoundary>
            ) : (
              "Show results"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
