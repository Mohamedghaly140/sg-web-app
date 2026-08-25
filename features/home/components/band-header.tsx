import Link from "next/link";

type BandHeaderProps = {
  title: string;
  linkHref: string;
  linkLabel: string;
};

/* The design's band header (S1, `Storefront Screens.dc.html:32,40`): an h3 and a
   trailing link sitting on a shared baseline over a hairline. `font-normal`
   overrides globals.css, which sets h3-h6 to 600. */
export function BandHeader({ title, linkHref, linkLabel }: BandHeaderProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-2">
      <h3 className="font-heading text-2xl font-normal text-foreground">
        {title}
      </h3>
      <Link
        href={linkHref}
        className="text-xs text-accent-strong underline-offset-3 hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
