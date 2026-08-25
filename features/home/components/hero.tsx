import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div
        aria-hidden
        className="plate relative aspect-[4/3] w-full overflow-hidden bg-muted lg:aspect-auto lg:h-[520px]"
      >
        <video
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <div className="self-center">
        <div className="text-eyebrow">Autumn · 2026</div>
        <h1 className="my-3 font-heading text-[52px] font-normal leading-[1.03] text-foreground">
          A world of timeless designs
        </h1>
        <p className="measure max-w-[44ch] text-muted-foreground">
          Made to honour the people who make them and the places they are made.
          Cut, sewn and finished in our Cairo atelier — pieces meant to outlast
          the season they were drawn for.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="default"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Shop new in
          </Button>
          <Button
            variant="secondary"
            render={<Link href="/categories" />}
            nativeButton={false}
          >
            Meet the makers
          </Button>
        </div>
      </div>
    </section>
  );
}
