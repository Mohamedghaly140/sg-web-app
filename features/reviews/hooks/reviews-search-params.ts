import {
  createParser,
  createSearchParamsCache,
  parseAsInteger,
} from "nuqs/server";

const parseAsPage = createParser<number>({
  parse(value) {
    const parsed = parseAsInteger.parse(value);
    return parsed !== null && parsed >= 1 ? parsed : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(1);

const parseAsLimit = createParser<number>({
  parse(value) {
    const parsed = parseAsInteger.parse(value);
    return parsed !== null && parsed >= 1 && parsed <= 100 ? parsed : null;
  },
  serialize(value) {
    return String(value);
  },
}).withDefault(20);

export const reviewsParamsParsers = {
  page: parseAsPage,
  limit: parseAsLimit,
};

export const reviewsSearchParamsCache = createSearchParamsCache(
  reviewsParamsParsers,
);

// Review pagination uses server-rendered numbered links, so no client hook companion is needed.
