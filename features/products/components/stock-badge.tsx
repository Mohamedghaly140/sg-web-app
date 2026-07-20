import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 5;

type StockBadgeProps = {
  quantity: number;
};

export function StockBadge({ quantity }: StockBadgeProps) {
  if (quantity <= 0) {
    return <Badge variant="destructive">Sold out</Badge>;
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return <Badge variant="warning">Only {quantity} left</Badge>;
  }

  return null;
}
