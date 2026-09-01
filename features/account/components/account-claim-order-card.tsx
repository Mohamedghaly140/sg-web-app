import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountClaimOrderForm } from "@/features/account/components/account-claim-order-form";

export function AccountClaimOrderCard() {
  return (
    <Card className="gap-4 lg:flex-row lg:items-center">
      <CardHeader className="min-w-0 flex-1">
        <CardTitle className="text-[19px] font-normal">
          Ordered as a guest before?
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm">
          Paste the tracking code from that confirmation email and the order
          moves into this account, keeping your history in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full lg:w-[360px] lg:shrink-0">
        <AccountClaimOrderForm />
      </CardContent>
    </Card>
  );
}
