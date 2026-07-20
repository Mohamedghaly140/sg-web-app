import Link from "next/link";
import { LucideCamera, LucideGlobe } from "lucide-react";

import { Button } from "@/components/ui/button";

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="font-heading text-lg font-semibold text-foreground">
            SG Couture
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Elegant couture, delivered to your door.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <LucideCamera className="size-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <LucideGlobe className="size-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Shop</span>
          {SHOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">
            Stay in the loop
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Get updates on new arrivals.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              disabled
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground outline-none"
            />
            <Button type="button" size="sm" disabled>
              Notify me
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-border px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} SG Couture. All rights reserved.</p>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium">
          Cash on Delivery
        </span>
      </div>
    </footer>
  );
}
