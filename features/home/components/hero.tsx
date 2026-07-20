import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import heroImage from "@/public/hero-couture.svg";

export function Hero() {
  return (
    <section className="relative flex flex-col overflow-hidden rounded-md sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-4 bg-muted px-6 py-10 sm:px-10 sm:py-16">
        <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
          Elegant Couture, Delivered to Your Door
        </h1>
        <p className="text-muted-foreground">
          Discover this season&apos;s collection.
        </p>
        <Button render={<Link href="/products" />} className="w-full sm:w-fit">
          Shop Now →
        </Button>
      </div>
      <div
        aria-hidden
        className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 sm:aspect-square sm:w-full sm:max-w-md"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 400px, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
