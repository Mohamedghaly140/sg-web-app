import {
  CircleCheck as LucideCircleCheck,
  Package as LucidePackage,
  Receipt as LucideReceipt,
  Truck as LucideTruck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { OrderStatus } from "@/features/orders/types/order";
import { cn } from "@/lib/utils";

const STEPPER_STAGES = [
  { key: "PENDING", label: "Placed", Icon: LucideReceipt },
  { key: "PROCESSING", label: "Processing", Icon: LucidePackage },
  { key: "SHIPPED", label: "Shipped", Icon: LucideTruck },
  { key: "DELIVERED", label: "Delivered", Icon: LucideCircleCheck },
] as const satisfies ReadonlyArray<{
  key: OrderStatus;
  label: string;
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
};

export function OrderStatusStepper({
  status,
  variant,
}: OrderStatusStepperProps) {
  const currentIndex = STAGE_INDEX[status];
  if (currentIndex === undefined) {
    return null;
  }

  if (variant === "track") {
    return (
      <ol className="grid grid-cols-4" aria-label="Order progress">
        {STEPPER_STAGES.map((stage, index) => {
          const isReached = index <= currentIndex;

          return (
            <li
              key={stage.key}
              aria-current={index === currentIndex ? "step" : undefined}
              className="flex min-w-0 flex-col gap-2"
            >
              <span
                aria-hidden
                className={cn(
                  "w-full border-t",
                  isReached ? "border-t-accent" : "border-t-border",
                )}
              />
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
            </li>
          );
        })}
      </ol>
    );
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
    <ol
      className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0"
      aria-label="Order progress"
    >
      {STEPPER_STAGES.map((stage, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        const Icon = stage.Icon;

        return (
          <li
            key={stage.key}
            className={cn(
              "relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:px-1",
              index < STEPPER_STAGES.length - 1 && "pb-6 sm:pb-0",
            )}
          >
            {index < STEPPER_STAGES.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute bg-border sm:top-5 sm:right-0 sm:left-[calc(50%+1.25rem)] sm:h-px sm:w-[calc(100%-2.5rem)]",
                  "top-10 bottom-0 left-[1.1875rem] w-px",
                  isComplete && "bg-foreground",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border",
                isComplete && "border-foreground bg-foreground text-background",
                isCurrent && "border-accent bg-accent text-accent-foreground",
                isUpcoming &&
                  "border-border bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>

            <div className="flex min-w-0 flex-col gap-0.5 pt-2 sm:items-center sm:pt-0 sm:text-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  isUpcoming ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {stage.label}
              </span>
              {isCurrent ? (
                <span className="text-xs text-muted-foreground">Current</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
