import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersHeader } from "@/features/orders/components/orders-header";

const SKELETON_ROW_COUNT = 5;

type OrdersListSkeletonProps = {
  filter: ReactNode;
};

export function OrdersListSkeleton({ filter }: OrdersListSkeletonProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3" aria-busy="true">
      <OrdersHeader
        count={<Skeleton className="h-3 w-28" />}
        filter={filter}
      />
      <ul className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
          <li key={index}>
            <Card size="sm">
              <CardHeader className="flex flex-row items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="ml-auto h-3 w-32" />
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Skeleton className="aspect-[3/4] w-[46px] shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
              <CardFooter className="gap-2 border-t-0 pt-0">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
