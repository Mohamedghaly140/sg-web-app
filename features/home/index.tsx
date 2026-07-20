import { Suspense } from "react";

import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";
import { CategorySectionSkeleton } from "@/features/home/components/category-section-skeleton";
import { CategorySection } from "@/features/home/components/category-section";
import { Hero } from "@/features/home/components/hero";
import { ProductSectionSkeleton } from "@/features/home/components/product-section-skeleton";
import { ProductSection } from "@/features/home/components/product-section";

export default function HomeFeature() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      <SectionErrorBoundary title="Shop by Category">
        <Suspense fallback={<CategorySectionSkeleton />}>
          <CategorySection />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Featured">
        <Suspense fallback={<ProductSectionSkeleton title="Featured" />}>
          <ProductSection
            title="Featured"
            viewAllHref="/products?featured=true"
            queryParams={{ featured: true, limit: 10 }}
          />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="New Arrivals">
        <Suspense fallback={<ProductSectionSkeleton title="New Arrivals" />}>
          <ProductSection
            title="New Arrivals"
            viewAllHref="/products"
            queryParams={{ sort: "newest", limit: 10 }}
          />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
