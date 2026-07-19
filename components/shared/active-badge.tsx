import { Badge } from "@/components/ui/badge";

type ActiveBadgeProps = {
  active: boolean;
};

export function ActiveBadge({ active }: ActiveBadgeProps) {
  return (
    <Badge variant={active ? "success" : "outline"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
