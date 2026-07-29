"use client";

import { useRef, useState, type UIEvent } from "react";
import { LucideHeart } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
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

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3"
          aria-label="Wishlist coming soon"
          disabled
        >
          <LucideHeart data-icon="inline-start" />
        </Button>
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
                "size-2 rounded-full transition-colors",
                activeIndex === index
                  ? "bg-primary"
                  : "bg-muted-foreground/30",
              )}
              aria-label={`Show image ${index + 1} of ${slides.length}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => selectMobileSlide(index)}
            />
          ))}
        </div>
      )}

      <div className="hidden grid-cols-[5rem_minmax(0,1fr)] gap-4 sm:grid">
        {slides.length > 1 && (
          <div className="flex max-h-[45rem] flex-col gap-3 overflow-y-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={cn(
                  "relative aspect-[4/5] w-full shrink-0 overflow-hidden border bg-muted outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
                  activeIndex === index
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border",
                )}
                aria-label={`Show image ${index + 1} of ${slides.length}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={cldUrl(slide.imageUrl, {
                    width: 120,
                    height: 150,
                    crop: "fill",
                    quality: "auto",
                    format: "auto",
                  })}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden bg-muted",
            slides.length === 1 && "col-span-2",
          )}
        >
          <Image
            src={cldUrl(activeSlide.imageUrl, {
              width: 800,
              height: 1000,
              crop: "fill",
              quality: "auto",
              format: "auto",
            })}
            alt={`${productName} — image ${activeIndex + 1}`}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 70vw"
            className="object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="Wishlist coming soon"
            disabled
          >
            <LucideHeart data-icon="inline-start" />
          </Button>
        </div>
      </div>
    </div>
  );
}
