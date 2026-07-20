import {
  createParser,
  createSearchParamsCache,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

import type {
  GetProductsParams,
  ProductsSortOption,
} from "@/features/products/queries/get-products";

const SORT_OPTIONS: ProductsSortOption[] = [
  "newest",
  "price_asc",
  "price_desc",
  "best_selling",
  "top_rated",
];

const parseAsTrimmedSearch = createParser<string>({
  parse(value) {
    const trimmed = value.trim().slice(0, 100);
    return trimmed.length > 0 ? trimmed : null;
  },
  serialize(value) {
    return value;
  },
});

// Trim + drop empty entries only. Do NOT dedupe or sort — the backend
// contract treats sizes/colors as verbatim CSV passthrough.
const parseAsCsv = createParser<string>({
  parse(value) {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items.join(",") : null;
  },
  serialize(value) {
    return value;
  },
});

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

const parseAsPrice = createParser<number>({
  parse(value) {
    if (!PRICE_PATTERN.test(value)) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  },
  serialize(value) {
    return String(value);
  },
});

const parseAsPage = createParser<number>({
  parse(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(1, parsed) : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(1);

const parseAsLimit = createParser<number>({
  parse(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(20);

export const productsParsers = {
  search: parseAsTrimmedSearch,
  category: parseAsString,
  subCategory: parseAsString,
  minPrice: parseAsPrice,
  maxPrice: parseAsPrice,
  sizes: parseAsCsv,
  colors: parseAsCsv,
  featured: parseAsBoolean,
  sort: parseAsStringEnum<ProductsSortOption>(SORT_OPTIONS).withDefault("newest"),
  page: parseAsPage,
  limit: parseAsLimit,
};

export const productsSearchParamsCache = createSearchParamsCache(productsParsers);

export type ProductsSearchParams = Awaited<
  ReturnType<typeof productsSearchParamsCache.parse>
>;

export function toGetProductsParams(
  params: ProductsSearchParams,
): GetProductsParams {
  const result: GetProductsParams = {
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  };
  if (params.search !== null) result.search = params.search;
  if (params.category !== null) result.category = params.category;
  if (params.subCategory !== null) result.subCategory = params.subCategory;
  if (params.minPrice !== null) result.minPrice = params.minPrice;
  if (params.maxPrice !== null) result.maxPrice = params.maxPrice;
  if (params.sizes !== null) result.sizes = params.sizes;
  if (params.colors !== null) result.colors = params.colors;
  if (params.featured !== null) result.featured = params.featured;
  return result;
}
