import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderDetail } from "@/features/checkout/types/order";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import { isSameDecimal } from "@/lib/format";

type OrderPaymentCardProps = {
  order: OrderDetail;
};

export function OrderPaymentCard({ order }: OrderPaymentCardProps) {
  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.value === order.paymentMethod)
      ?.label ?? order.paymentMethod;
  const hasDiscount = !isSameDecimal(order.discountApplied, "0");

  return (
    <Card className="gap-3 shadow-none [--card-spacing:--spacing(3)]">
      <CardHeader className="pb-0">
        <CardTitle className="font-normal">Payment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="figures flex flex-col gap-1.5 text-[13px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Items subtotal</dt>
            <dd>
              <Money value={order.itemsSubtotal} />
            </dd>
          </div>
          {hasDiscount ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>
                −<Money value={order.discountApplied} />
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>
              <Money value={order.shippingFees} />
            </dd>
          </div>
        </dl>
        <Separator className="my-1" />
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-heading text-lg font-normal">Total</span>
          <span className="figures font-heading text-[21px] font-normal">
            <Money value={order.totalOrderPrice} />
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">{paymentLabel}</span>
          <Badge variant="outline">{order.isPaid ? "Paid" : "Unpaid"}</Badge>
        </div>
        {order.paymentMethod === "CASH" && !order.isPaid ? (
          <p className="measure max-w-none text-2xs text-muted-foreground">
            Pay the courier in cash when the parcel arrives.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
