import { Skeleton } from "@/components/ui/skeleton";
import { BandHeader } from "@/features/home/components/band-header";

const SKELETON_COLLECTION_COUNT = 3;

export function CollectionsSectionSkeleton() {
  return (
    <section>
      <BandHeader
        title="The collections"
        linkHref="/categories"
        linkLabel="All categories"
      />
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {Array.from({ length: SKELETON_COLLECTION_COUNT }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="mt-2 h-5 w-2/3" />
          </div>
        ))}
      </div>
    </section>
  );
}
