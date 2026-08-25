import { Badge } from "@/components/ui/badge";

type DiscountBadgeProps = {
  discount: string;
};

export function DiscountBadge({ discount }: DiscountBadgeProps) {
  const percent = Math.round(Number(discount));

  if (percent <= 0) {
    return null;
  }

  // U+2212 MINUS SIGN, not a hyphen — it is what the design sets and it aligns
  // with the tabular figures the price rows use.
  return <Badge variant="accent">&minus;{percent}%</Badge>;
}
