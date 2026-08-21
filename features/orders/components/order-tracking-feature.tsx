import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { claimOrderAction } from "@/features/orders/actions/claim-order";
import { ClaimOrderGate } from "@/features/orders/components/claim-order-gate";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { TrackingRateLimited } from "@/features/orders/components/tracking-rate-limited";
import { getGuestOrder } from "@/features/orders/queries/get-guest-order";

type OrderTrackingFeatureProps = {
  token: string;
};

export default async function OrderTrackingFeature({
  token,
}: OrderTrackingFeatureProps) {
  const result = await getGuestOrder(token);
  if (result.status === "rate_limited") {
    return <TrackingRateLimited />;
  }

  const claimAction = claimOrderAction.bind(null, token);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetailView order={result.order} />
      <Card>
        <CardHeader>
          <CardTitle>Claim this order</CardTitle>
        </CardHeader>
        <CardContent>
          <ClaimOrderGate action={claimAction} />
        </CardContent>
      </Card>
    </div>
  );
}
