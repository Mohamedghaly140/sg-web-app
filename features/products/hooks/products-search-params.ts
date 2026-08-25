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

// Defaults are named so the parsers and `buildProductsHref` cannot drift: the
// href builder omits any value still sitting on its default, which is what
// keeps a freshly cleared listing at a bare `/products`.
export const DEFAULT_SORT: ProductsSortOption = "newest";
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

const parseAsPage = createParser<number>({
  parse(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(1, parsed) : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(DEFAULT_PAGE);

const parseAsLimit = createParser<number>({
  parse(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(DEFAULT_LIMIT);

export const productsParsers = {
  search: parseAsTrimmedSearch,
  category: parseAsString,
  subCategory: parseAsString,
  minPrice: parseAsPrice,
  maxPrice: parseAsPrice,
  sizes: parseAsCsv,
  colors: parseAsCsv,
  featured: parseAsBoolean,
  sort: parseAsStringEnum<ProductsSortOption>(SORT_OPTIONS).withDefault(DEFAULT_SORT),
  page: parseAsPage,
  limit: parseAsLimit,
};

export const productsSearchParamsCache = createSearchParamsCache(productsParsers);

export type ProductsSearchParams = Awaited<
  ReturnType<typeof productsSearchParamsCache.parse>
>;

/**
 * Build a `/products` href from the current params plus a partial override.
 *
 * An override of `null` removes that filter, which is what every applied-filter
 * `✕` and the "Clear all" link are: a plain URL, so the whole applied-filter row
 * and the pagination stay Server Components with no client JavaScript.
 *
 * `page` resets to 1 on any change, because a filtered result set has no
 * meaningful page 3 from the previous one — unless `page` is itself the thing
 * being overridden, which is how pagination moves.
 */
export function buildProductsHref(
  params: ProductsSearchParams,
  overrides: Partial<ProductsSearchParams> = {},
): string {
  const next = { ...params, ...overrides };
  const page = "page" in overrides ? next.page : DEFAULT_PAGE;
  const query = new URLSearchParams();

  if (next.search !== null) query.set("search", next.search);
  if (next.category !== null) query.set("category", next.category);
  if (next.subCategory !== null) query.set("subCategory", next.subCategory);
  if (next.minPrice !== null) query.set("minPrice", String(next.minPrice));
  if (next.maxPrice !== null) query.set("maxPrice", String(next.maxPrice));
  // sizes/colors are verbatim CSV passthrough -- never deduped or reordered.
  if (next.sizes !== null) query.set("sizes", next.sizes);
  if (next.colors !== null) query.set("colors", next.colors);
  if (next.featured !== null) query.set("featured", String(next.featured));
  if (next.sort !== DEFAULT_SORT) query.set("sort", next.sort);
  if (next.limit !== DEFAULT_LIMIT) query.set("limit", String(next.limit));
  if (page !== DEFAULT_PAGE) query.set("page", String(page));

  const search = query.toString();
  return search.length > 0 ? `/products?${search}` : "/products";
}

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
