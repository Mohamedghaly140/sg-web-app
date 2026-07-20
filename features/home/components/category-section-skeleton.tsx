import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_TILE_COUNT = 6;

export function CategorySectionSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          Shop by Category
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: SKELETON_TILE_COUNT }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
