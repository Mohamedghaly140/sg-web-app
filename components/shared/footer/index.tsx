import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-2 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <span>Cash on delivery across Egypt</span>
        <span aria-hidden="true">·</span>
        <span>Delivery from 65 EGP</span>
        <span aria-hidden="true">·</span>
        <Link
          href="/orders/track"
          className="text-muted-foreground hover:text-foreground"
        >
          Track an order
        </Link>
        <span aria-hidden="true">·</span>
        <span>© {new Date().getFullYear()} SG Couture</span>
      </div>
    </footer>
  );
}
