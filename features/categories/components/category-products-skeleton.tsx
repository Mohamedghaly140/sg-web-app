import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARD_COUNT = 4;

export function CategoryProductsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Products</h2>
      </div>
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <div key={index} className="flex w-[75vw] shrink-0 flex-col gap-2 sm:w-56">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <Skeleton className="h-[12px] w-3/4" />
            <Skeleton className="h-[12px] w-3/5" />
            <Skeleton className="h-[12px] w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
