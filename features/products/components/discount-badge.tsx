import { Badge } from "@/components/ui/badge";

type DiscountBadgeProps = {
  discount: string;
};

export function DiscountBadge({ discount }: DiscountBadgeProps) {
  const percent = Math.round(Number(discount));

  if (percent <= 0) {
    return null;
  }

  return <Badge variant="secondary">-{percent}%</Badge>;
}
