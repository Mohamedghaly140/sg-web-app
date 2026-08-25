import { RadioDot } from "@/components/shared/radio-dot";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";

export type PaymentMethodSelectProps = {
  name: string;
  defaultValue?: string;
};

// Uncontrolled by design — v1 has exactly one enabled option, so there is no
// interactive state to lift. The schema (`paymentMethodSchema`) is the real
// gate; this UI is defense in depth per §5.6.
export function PaymentMethodSelect({ name, defaultValue = "CASH" }: PaymentMethodSelectProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-foreground">Payment method</legend>
      {PAYMENT_METHODS.map((method) => (
        <label key={method.value} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={method.value}
            defaultChecked={method.value === defaultValue}
            disabled={!method.enabled}
            className="peer sr-only"
          />
          <RadioDot selected={method.value === defaultValue} />
          <span className={method.enabled ? "text-foreground" : "text-muted-foreground"}>
            {method.label}
            {method.disabledReason ? ` (${method.disabledReason})` : ""}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
