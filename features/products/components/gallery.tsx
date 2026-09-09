"use client";

import { useRef, useState, type UIEvent } from "react";
import Image from "next/image";

import type { ProductImage } from "@/features/products/types/product";
import { cldUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

type GalleryProps = {
  images: ProductImage[];
  fallbackImageUrl: string;
  productName: string;
};

type GallerySlide = {
  id: string;
  imageUrl: string;
};

export function Gallery({
  images,
  fallbackImageUrl,
  productName,
}: GalleryProps) {
  const mobileRailRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // The contract allows a null imageUrl on any gallery item; substitute the
  // product's top-level image for that slot so order/count are preserved
  // (docs/screens/product-detail.md §2), rather than dropping the slot.
  const galleryImages = images.map<GallerySlide>((image) => ({
    id: image.id,
    imageUrl: image.imageUrl ?? fallbackImageUrl,
  }));
  const slides =
    galleryImages.length > 0
      ? galleryImages
      : [{ id: "fallback", imageUrl: fallbackImageUrl }];
  const activeIndex = Math.min(selectedIndex, slides.length - 1);
  const activeSlide = slides[activeIndex];

  function handleMobileScroll(event: UIEvent<HTMLDivElement>) {
    const rail = event.currentTarget;

    if (rail.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.min(
      slides.length - 1,
      Math.max(0, Math.round(rail.scrollLeft / rail.clientWidth)),
    );
    setSelectedIndex(nextIndex);
  }

  function selectMobileSlide(index: number) {
    setSelectedIndex(index);
    mobileRailRef.current?.scrollTo({
      left: mobileRailRef.current.clientWidth * index,
      behavior: "smooth",
    });
  }

  return (
    <div>
      <div className="relative sm:hidden">
        <div
          ref={mobileRailRef}
          className="flex snap-x snap-mandatory overflow-x-auto"
          onScroll={handleMobileScroll}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative aspect-[4/5] min-w-full snap-center overflow-hidden bg-muted"
            >
              <Image
                src={cldUrl(slide.imageUrl, {
                  width: 800,
                  height: 1000,
                  crop: "fill",
                  quality: "auto",
                  format: "auto",
                })}
                alt={`${productName} — image ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div
          className="mt-3 flex justify-center gap-2 sm:hidden"
          aria-label="Choose product image"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={cn(
                "h-6 w-8 border-t transition-colors pointer-coarse:min-h-10 pointer-coarse:min-w-10",
                activeIndex === index
                  ? "border-accent-strong"
                  : "border-muted-foreground/30",
              )}
              aria-label={`Show image ${index + 1} of ${slides.length}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => selectMobileSlide(index)}
            />
          ))}
        </div>
      )}

      {/* 13.3: below `lg` the PDP grid is one column, so this gallery gets the whole
          frame — 975px of content at a 1023px viewport, which stretches the 660px
          hero into a 1.30 landscape box. Cap the pair at its designed width instead
          of giving the hero an aspect ratio: `aspect-[3/4]` would compute a 1140px
          tall hero at 1023px, worse than the defect it was meant to fix, because
          width is the runaway variable here, not the ratio. Phase 9 §9.5's "do not
          give the hero an aspect ratio" therefore still stands at every width — 13.3
          needs no exception after all. */}
      <div className="mx-auto w-full max-w-[792px] lg:mx-0 lg:max-w-none">
        <div className="hidden grid-cols-[108px_minmax(0,1fr)] items-start gap-3 sm:grid">
          {/* Capped to the hero's height and scrolled past it: `images[]` has no
              documented limit, and an unbounded column would outgrow the 660px
              hero and drive the grid row taller than the gallery itself. */}
          <div className="flex max-h-[660px] flex-col gap-2 overflow-y-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="relative aspect-[3/4] w-full shrink-0 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Show image ${index + 1} of ${slides.length}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => setSelectedIndex(index)}
              >
                <div
                  className={cn(
                    "plate relative h-full w-full overflow-hidden",
                    activeIndex === index && "plate-selected",
                  )}
                >
                  <Image
                    src={cldUrl(slide.imageUrl, {
                      width: 96,
                      height: 132,
                      crop: "fill",
                      quality: "auto",
                      format: "auto",
                    })}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="relative h-[660px] bg-muted">
            <div className="plate relative h-full w-full overflow-hidden">
              <Image
                src={cldUrl(activeSlide.imageUrl, {
                  width: 600,
                  height: 648,
                  crop: "fill",
                  quality: "auto",
                  format: "auto",
                })}
                alt={`${productName} — image ${activeIndex + 1}`}
                fill
                priority
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) calc(100vw - 624px), min(672px, calc(100vw - 168px))"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
