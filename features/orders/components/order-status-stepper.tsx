import {
  CircleCheck as LucideCircleCheck,
  Package as LucidePackage,
  Receipt as LucideReceipt,
  Truck as LucideTruck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { OrderStatus } from "@/features/orders/types/order";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPPER_STAGES = [
  {
    key: "PENDING",
    label: "Placed",
    detailLabel: "Placed",
    Icon: LucideReceipt,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    detailLabel: "Preparing",
    Icon: LucidePackage,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    detailLabel: "Shipped",
    Icon: LucideTruck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    detailLabel: "Delivered",
    Icon: LucideCircleCheck,
  },
] as const satisfies ReadonlyArray<{
  key: OrderStatus;
  label: string;
  detailLabel: string;
  Icon: LucideIcon;
}>;

const STAGE_INDEX: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

type OrderStatusStepperProps = {
  status: OrderStatus;
  variant: "row" | "detail" | "track";
  placedAt?: string;
};

type OrderStatusColumnsProps = {
  currentIndex: number;
  variant: "detail" | "track";
  placedAt?: string;
};

function OrderStatusColumns({
  currentIndex,
  variant,
  placedAt,
}: OrderStatusColumnsProps) {
  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {STEPPER_STAGES.map((stage, index) => {
        const isReached = index <= currentIndex;

        return (
          <li
            key={stage.key}
            aria-current={index === currentIndex ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-col",
              variant === "track" && "gap-2",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "w-full border-t",
                variant === "detail" && "mb-2",
                isReached ? "border-t-accent" : "border-t-border",
              )}
            />
            {variant === "track" ? (
              <span
                className={cn(
                  "truncate text-[11px] tracking-[0.08em] uppercase",
                  isReached
                    ? "text-accent-strong"
                    : "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "text-xs",
                    isReached
                      ? "text-accent-strong"
                      : "text-muted-foreground",
                  )}
                >
                  {stage.detailLabel}
                </span>
                <span className="figures text-[11.5px] text-muted-foreground">
                  {index === 0 && placedAt ? formatDateTime(placedAt) : "—"}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderStatusStepper({
  status,
  variant,
  placedAt,
}: OrderStatusStepperProps) {
  const currentIndex = STAGE_INDEX[status];
  if (currentIndex === undefined) {
    return null;
  }

  if (variant === "track") {
    return <OrderStatusColumns currentIndex={currentIndex} variant="track" />;
  }

  if (variant === "row") {
    return (
      <div className="flex items-center gap-2" aria-hidden>
        <div className="flex items-center gap-1">
          {STEPPER_STAGES.map((stage, index) => (
            <span
              key={stage.key}
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                index < currentIndex && "bg-foreground",
                index === currentIndex && "bg-accent",
                index > currentIndex && "bg-border",
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {STEPPER_STAGES[currentIndex].label}
        </span>
      </div>
    );
  }

  return (
    <OrderStatusColumns
      currentIndex={currentIndex}
      variant="detail"
      placedAt={placedAt}
    />
  );
}
