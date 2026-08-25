import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARD_COUNT = 12;

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <Skeleton className="h-[12px] w-3/4" />
          <Skeleton className="h-[12px] w-3/5" />
          <Skeleton className="h-[12px] w-2/3" />
        </div>
      ))}
    </div>
  );
}
