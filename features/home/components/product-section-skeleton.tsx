import { Skeleton } from "@/components/ui/skeleton";
import { BandHeader } from "@/features/home/components/band-header";

type ProductSectionSkeletonProps = {
  title: string;
  /* Mirrors the resolved section's link. The fallback is interactive while the
     band streams, so a hardcoded href would send an early click to the wrong
     listing. */
  viewAllHref: string;
};

const SKELETON_CARD_COUNT = 4;

export function ProductSectionSkeleton({
  title,
  viewAllHref,
}: ProductSectionSkeletonProps) {
  return (
    <section>
      <BandHeader title={title} linkHref={viewAllHref} linkLabel="See all" />
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
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
