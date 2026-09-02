import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";

type OrderHelpCardProps = {
  orderId: string;
  /**
   * Owner account detail only. Self-cancellation is authenticated, so on guest
   * tracking `canCancel` is always false — copy describing it would promise an
   * action that reader can never take, no matter the order's status.
   */
  isOwner: boolean;
  canCancel: boolean;
};

export function OrderHelpCard({
  orderId,
  isOwner,
  canCancel,
}: OrderHelpCardProps) {
  return (
    <Card className="gap-3 shadow-none [--card-spacing:--spacing(3)]">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-normal">
          Need to change something?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="measure max-w-none text-xs text-muted-foreground">
          {isOwner
            ? "While an order is pending you can cancel it yourself. Once the atelier starts preparing it, message us instead."
            : "The atelier can answer questions about this order and make changes on your behalf."}
        </p>
        {canCancel ? (
          <CancelOrderButton
            orderId={orderId}
            label="Cancel this order"
            variant="default"
            size="lg"
            className="w-full"
          />
        ) : null}
        <Button
          render={<Link href="/contact" />}
          nativeButton={false}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Message the atelier
        </Button>
        {canCancel ? (
          <p className="measure max-w-none text-2xs text-muted-foreground">
            Cancelling returns the pieces to the shop and frees your coupon. It
            cannot be undone.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
