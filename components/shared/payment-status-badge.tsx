import { Badge } from "@/components/ui/badge";

type PaymentStatusBadgeProps = {
  isPaid: boolean;
};

export function PaymentStatusBadge({ isPaid }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={isPaid ? "success" : "warning"}>
      {isPaid ? "Paid" : "Unpaid"}
    </Badge>
  );
}
