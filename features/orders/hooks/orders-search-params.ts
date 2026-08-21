import {
  createParser,
  createSearchParamsCache,
  parseAsStringEnum,
} from "nuqs/server";

import type { GetOrdersParams } from "@/features/orders/queries/get-orders";
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/features/orders/types/order";

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

const status = parseAsStringEnum<OrderStatus>(ORDER_STATUSES);

export const ordersParsers = {
  status,
  page: parseAsPage,
  limit: parseAsLimit,
};

export const ordersSearchParamsCache = createSearchParamsCache(ordersParsers);

export type OrdersSearchParams = Awaited<
  ReturnType<typeof ordersSearchParamsCache.parse>
>;

export function toGetOrdersParams(
  params: OrdersSearchParams,
): GetOrdersParams {
  const result: GetOrdersParams = {
    page: params.page,
    limit: params.limit,
  };
  if (params.status !== null) result.status = params.status;
  return result;
}
