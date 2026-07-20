import { Skeleton } from "@/components/ui/skeleton";

type ProductSectionSkeletonProps = {
  title: string;
};

const SKELETON_CARD_COUNT = 4;

export function ProductSectionSkeleton({ title }: ProductSectionSkeletonProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <div key={index} className="flex w-[75vw] shrink-0 flex-col gap-2 sm:w-56">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
