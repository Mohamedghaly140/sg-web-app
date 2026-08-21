import { Alert, AlertDescription } from "@/components/ui/alert";
import { TRACKING_RATE_LIMITED_MESSAGE } from "@/features/orders/lib/order-tracking-copy";
import { TrackingRefreshButton } from "@/features/orders/components/tracking-refresh-button";

export function TrackingRateLimited() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6 lg:px-8">
      <Alert>
        <AlertDescription>{TRACKING_RATE_LIMITED_MESSAGE}</AlertDescription>
      </Alert>
      <TrackingRefreshButton />
    </div>
  );
}
