import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import { Money } from "@/components/shared/money";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import type { OrderItemParsed } from "@/features/checkout/schema/order-item-schema";
import type { OrderStatus } from "@/features/checkout/types/order";
import { formatDate, isSameDecimal } from "@/lib/format";

/* Visible column labels for the stacked presentation below `md`. They are
   aria-hidden because the sr-only <thead> already names every column — without
   that, a screen reader on a phone reads "Piece Piece Silk shirt". Kept in
   lockstep with the account overview's copy of this pattern
   (features/account/components/account-earlier-orders.tsx). */
const stackedLabelClassName =
  "text-[11px] tracking-[0.08em] text-muted-foreground uppercase md:hidden";

export type OrderConfirmationProps = {
  customerName: string;
  humanOrderId: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: string;
  totalOrderPrice: string;
  items: OrderItemParsed[];
  itemsSubtotal: string;
  discountApplied: string;
  couponCode?: string;
  shippingFees: string;
  deliveryDestination: string;
  isGuest: boolean;
  orderId?: string;
  claimToken?: "sent-by-email";
  email?: string;
};

export function OrderConfirmation({
  customerName,
  humanOrderId,
  createdAt,
  status,
  paymentMethod,
  totalOrderPrice,
  items,
  itemsSubtotal,
  discountApplied,
  couponCode,
  shippingFees,
  deliveryDestination,
  isGuest,
  orderId,
  claimToken,
  email,
}: OrderConfirmationProps) {
  const hasDiscount = !isSameDecimal(discountApplied, "0");

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-eyebrow">Order placed · {formatDate(createdAt)}</p>
      <h2 className="font-heading text-display-4 font-normal">
        Thank you, {customerName}.
      </h2>
      <p className="max-w-[56ch] text-left text-sm text-muted-foreground sm:text-justify">
        Your order <span className="figures text-foreground">{humanOrderId}</span>{" "}
        is confirmed and being prepared.
      </p>

      <div className="border-t border-border" />

      <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-3">
        <div>
          <p className="text-eyebrow mb-1">Status</p>
          <OrderStatusBadge status={status} />
        </div>
        <div>
          <p className="text-eyebrow mb-1">Payment</p>
          <p>
            {paymentMethod === "CASH" ? "Cash on delivery" : paymentMethod} ·{" "}
            <Money value={totalOrderPrice} />
          </p>
        </div>
        <div>
          <p className="text-eyebrow mb-1">Delivery</p>
          <p>
            {deliveryDestination} · <Money value={shippingFees} />
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="md:overflow-x-auto">
        {/* Below `md` the rows restyle to stacked blocks via `display`, matching
            the account overview's earlier-orders table (Phase 12.7). Browsers
            compute table semantics from the *computed* display value, so
            `block`/`flex` here would drop the implicit table roles and break the
            sr-only <thead> associations exactly where they are needed most.
            The explicit roles below survive the display override and are a no-op
            at `md`+, where they match what the elements already imply.
            The <thead> was visible on this screen before Phase 13.6; it is now
            sr-only at every width, because the stacked labels carry the column
            names below `md` and the four headers do not fit a 323.2px row. */}
        <table role="table" className="w-full text-sm max-md:block">
          <caption className="sr-only">Order items</caption>
          <thead role="rowgroup" className="sr-only">
            <tr role="row">
              <th scope="col">Piece</th>
              <th scope="col">Variant</th>
              <th scope="col">Qty</th>
              <th scope="col">Line total</th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="max-md:block">
            {items.map((item) => (
              <tr
                key={item.productId}
                role="row"
                className="border-b border-border last:border-0 max-md:flex max-md:flex-col max-md:gap-2 max-md:py-3"
              >
                <th
                  role="rowheader"
                  scope="row"
                  className="py-3 pr-4 text-left font-normal max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 max-md:pr-0 md:table-cell"
                >
                  <span aria-hidden="true" className={stackedLabelClassName}>
                    Piece
                  </span>
                  <span className="text-right md:text-left">{item.name}</span>
                </th>
                <td
                  role="cell"
                  className="py-3 pr-4 text-muted-foreground max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 max-md:pr-0 md:table-cell"
                >
                  <span aria-hidden="true" className={stackedLabelClassName}>
                    Variant
                  </span>
                  <span className="text-right md:text-left">
                    {[item.color, item.size].filter(Boolean).join(" · ") || "—"}
                  </span>
                </td>
                <td
                  role="cell"
                  className="figures py-3 text-right max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 md:table-cell"
                >
                  <span aria-hidden="true" className={stackedLabelClassName}>
                    Qty
                  </span>
                  <span className="figures">{item.quantity}</span>
                </td>
                <td
                  role="cell"
                  className="figures py-3 text-right max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-3 max-md:py-0 md:table-cell"
                >
                  <span aria-hidden="true" className={stackedLabelClassName}>
                    Line total
                  </span>
                  <span className="figures">
                    <Money value={item.lineTotal} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border" />

      <div className="flex justify-end">
        <dl className="figures flex w-full flex-col gap-2 text-sm sm:w-[300px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Items subtotal</dt>
            <dd>
              <Money value={itemsSubtotal} />
            </dd>
          </div>
          {hasDiscount ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                Discount{couponCode ? ` · ${couponCode}` : ""}
              </dt>
              <dd>
                −<Money value={discountApplied} />
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>
              <Money value={shippingFees} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
            <dt className="font-medium text-foreground">Total</dt>
            <dd className="text-lg font-semibold text-foreground">
              <Money value={totalOrderPrice} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-t border-border" />

      {isGuest && claimToken === "sent-by-email" ? (
        <div className="flex flex-col items-start gap-4 border border-border p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Keep this order in an account
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an account{email ? ` with ${email}` : ""}, then use the
              tracking link in your email to claim this order into it.
            </p>
          </div>
          <SignUpButton
            mode="modal"
            fallbackRedirectUrl="/orders/track"
            initialValues={email ? { emailAddress: email } : undefined}
          >
            <Button type="button">Create account</Button>
          </SignUpButton>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {isGuest ? (
          <Button
            variant="outline"
            render={<Link href="/orders/track" />}
            nativeButton={false}
          >
            Track this order
          </Button>
        ) : orderId ? (
          <Button
            variant="outline"
            render={<Link href={`/account/orders/${orderId}`} />}
            nativeButton={false}
          >
            Track this order
          </Button>
        ) : null}
        <Button
          variant="ghost"
          render={<Link href="/products" />}
          nativeButton={false}
        >
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
