import type { Metadata } from "next";

import OrdersFeature from "@/features/orders";
import { ordersSearchParamsCache } from "@/features/orders/hooks/orders-search-params";

export const metadata: Metadata = {
  title: "Orders",
};

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const parsedSearchParams =
    await ordersSearchParamsCache.parse(resolvedSearchParams);

  return <OrdersFeature searchParams={parsedSearchParams} />;
}
