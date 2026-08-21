import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROW_COUNT = 5;

export function OrdersListSkeleton() {
  return (
    <ul className="divide-y divide-border bg-card ring-1 ring-foreground/10">
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}
