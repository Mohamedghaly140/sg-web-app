"use client";

import { useEffect, useRef, useState } from "react";
import { LucideSlidersHorizontal, LucideX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Category } from "@/features/categories/types/category";
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

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];
const COLOR_OPTIONS = ["Black", "White", "Emerald", "Navy", "Blush"];
const SEARCH_DEBOUNCE_MS = 400;

type ProductsFilterControlsProps = {
  categories: Category[];
};

function ProductsFilterControls({ categories }: ProductsFilterControlsProps) {
  const [params, setParams] = useProductsParams();
  const [searchState, setSearchState] = useState({
    paramValue: params.search,
    inputValue: params.search ?? "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (searchState.paramValue !== params.search) {
    setSearchState({
      paramValue: params.search,
      inputValue: params.search ?? "",
    });
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const selectedCategory = categories.find(
    (category) => category.slug === params.category,
  );
  const subCategoryOptions = selectedCategory?.subCategories ?? [];
  const selectedSizes = params.sizes ? params.sizes.split(",") : [];
  const selectedColors = params.colors ? params.colors.split(",") : [];

  function handleSearchChange(value: string) {
    setSearchState({ paramValue: params.search, inputValue: value });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams({ search: value.length > 0 ? value : null, page: 1 });
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleCategoryChange(value: string | null) {
    if (value === null) return;
    setParams({
      category: value === "all" ? null : value,
      subCategory: null,
      page: 1,
    });
  }

  function handleSubCategoryChange(value: string | null) {
    if (value === null) return;
    setParams({ subCategory: value === "all" ? null : value, page: 1 });
  }

  function handlePriceChange(field: "minPrice" | "maxPrice", value: string) {
    setParams({ [field]: value.length > 0 ? Number(value) : null, page: 1 });
  }

  function handleSizesChange(value: string[]) {
    setParams({ sizes: value.length > 0 ? value.join(",") : null, page: 1 });
  }

  function handleColorsChange(value: string[]) {
    setParams({ colors: value.length > 0 ? value.join(",") : null, page: 1 });
  }

  function handleFeaturedChange(pressed: boolean) {
    setParams({ featured: pressed ? true : null, page: 1 });
  }

  function handleSortChange(value: ProductsSearchParams["sort"] | null) {
    if (value === null) return;
    setParams({ sort: value, page: 1 });
  }

  function handleClearAll() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchState({ paramValue: null, inputValue: "" });
    setParams(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search products"
        value={searchState.inputValue}
        onChange={(event) => handleSearchChange(event.target.value)}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select value={params.category ?? "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {subCategoryOptions.length > 0 && (
          <Select
            value={params.subCategory ?? "all"}
            onValueChange={handleSubCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sub-category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All sub-categories</SelectItem>
                {subCategoryOptions.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.slug}>
                    {subCategory.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        <Select value={params.sort} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
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

        <Toggle pressed={params.featured === true} onPressedChange={handleFeaturedChange}>
          Featured
        </Toggle>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          step="0.01"
          placeholder="Min price"
          value={params.minPrice ?? ""}
          onChange={(event) => handlePriceChange("minPrice", event.target.value)}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          placeholder="Max price"
          value={params.maxPrice ?? ""}
          onChange={(event) => handlePriceChange("maxPrice", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Size</span>
        <ToggleGroup
          multiple
          spacing={2}
          value={selectedSizes}
          onValueChange={handleSizesChange}
        >
          {SIZE_OPTIONS.map((size) => (
            <ToggleGroupItem key={size} value={size}>
              {size}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Color</span>
        <ToggleGroup
          multiple
          spacing={2}
          value={selectedColors}
          onValueChange={handleColorsChange}
        >
          {COLOR_OPTIONS.map((color) => (
            <ToggleGroupItem key={color} value={color}>
              {color}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Button variant="outline" onClick={handleClearAll}>
        <LucideX />
        Clear all
      </Button>
    </div>
  );
}

type ProductsFiltersProps = {
  categories: Category[];
};

export function ProductsFilters({ categories }: ProductsFiltersProps) {
  return (
    <>
      <div className="hidden sm:block">
        <ProductsFilterControls categories={categories} />
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            <LucideSlidersHorizontal />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-4">
              <ProductsFilterControls categories={categories} />
            </div>
            <SheetFooter>
              <SheetClose render={<Button />}>Apply</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
