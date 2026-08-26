"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { getShippingFeeAction } from "@/features/checkout/actions/get-shipping-fee";
import type { ShippingFee } from "@/features/checkout/types/shipping";

export type ShippingEstimateProps = {
  country: string;
  governorate: string;
  city: string;
  onResolved: (fee: ShippingFee | null) => void;
  children?: (state: ShippingEstimateState) => ReactNode;
};

export type ShippingEstimateState = {
  isPending: boolean;
  fee: ShippingFee | null;
  error: string | null;
};

export function ShippingEstimate({
  country,
  governorate,
  city,
  onResolved,
  children,
}: ShippingEstimateProps) {
  const [isPending, startTransition] = useTransition();
  const [fee, setFee] = useState<ShippingFee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!governorate) {
      setFee(null);
      setError(null);
      onResolved(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setFee(null);
    setError(null);
    onResolved(null);

    startTransition(() => {
      void (async () => {
        const result = await getShippingFeeAction({ country, governorate, city });
        if (requestIdRef.current !== requestId) return;
        if ("error" in result) {
          setFee(null);
          setError(
            result.error.code === "SHIPPING_NOT_AVAILABLE"
              ? "We don't deliver to that destination yet."
              : result.error.message,
          );
          onResolved(null);
          return;
        }

        setError(null);
        setFee(result);
        onResolved(result);
      })();
    });
  }, [country, governorate, city, onResolved]);

  if (children) {
    return children({ isPending, fee, error });
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Estimating shipping…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!fee) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        Estimated shipping
        {fee.zone.city ? null : (
          <Badge variant="secondary" className="ml-2">
            Governorate rate
          </Badge>
        )}
      </span>
      <span className="font-medium text-foreground"><Money value={fee.fee} /></span>
    </div>
  );
}
