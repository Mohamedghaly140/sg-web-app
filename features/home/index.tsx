import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { CollectionsSectionSkeleton } from "@/features/home/components/collections-section-skeleton";
import { CollectionsSection } from "@/features/home/components/collections-section";
import { Hero } from "@/features/home/components/hero";
import { ProductSectionSkeleton } from "@/features/home/components/product-section-skeleton";
import { ProductSection } from "@/features/home/components/product-section";

/* `limit: 4` fills exactly one row of the design's 4-column grid
   (`Storefront Screens.dc.html:14` binds "New in" to
   `GET /products?featured=true&limit=4`). */
const BAND_PRODUCT_LIMIT = 4;

/* Each band's "See all" target is declared once and shared with its Suspense
   fallback, so an early click during streaming lands on the same listing the
   resolved band would have linked to. */
const NEW_IN_HREF = "/products?featured=true";
const NEW_ARRIVALS_HREF = "/products?sort=newest";

export default function HomeFeature() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      <SectionErrorBoundary title="The collections">
        <Suspense fallback={<CollectionsSectionSkeleton />}>
          <CollectionsSection />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="New in">
        <Suspense
          fallback={
            <ProductSectionSkeleton title="New in" viewAllHref={NEW_IN_HREF} />
          }
        >
          <ProductSection
            title="New in"
            viewAllHref={NEW_IN_HREF}
            queryParams={{ featured: true, limit: BAND_PRODUCT_LIMIT }}
          />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="New arrivals">
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="New arrivals"
              viewAllHref={NEW_ARRIVALS_HREF}
            />
          }
        >
          <ProductSection
            title="New arrivals"
            viewAllHref={NEW_ARRIVALS_HREF}
            queryParams={{ sort: "newest", limit: BAND_PRODUCT_LIMIT }}
          />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
