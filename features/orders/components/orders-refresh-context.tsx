"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OrdersRefreshState = {
  hasError: boolean;
  lastGood: ReactNode;
};

export type OrdersRefreshContextValue = OrdersRefreshState & {
  reportSuccess: (node: ReactNode) => void;
  reportError: () => void;
};

export const OrdersRefreshContext =
  createContext<OrdersRefreshContextValue | null>(null);

type OrdersRefreshProviderProps = {
  children: ReactNode;
};

export function OrdersRefreshProvider({
  children,
}: OrdersRefreshProviderProps) {
  const [state, setState] = useState<OrdersRefreshState>({
    hasError: false,
    lastGood: null,
  });

  const reportSuccess = useCallback((node: ReactNode) => {
    setState({ hasError: false, lastGood: node });
  }, []);

  const reportError = useCallback(() => {
    setState((previous) =>
      previous.hasError ? previous : { ...previous, hasError: true },
    );
  }, []);

  const contextValue = useMemo<OrdersRefreshContextValue>(
    () => ({ ...state, reportSuccess, reportError }),
    [state, reportSuccess, reportError],
  );

  return (
    <OrdersRefreshContext.Provider value={contextValue}>
      {children}
    </OrdersRefreshContext.Provider>
  );
}
