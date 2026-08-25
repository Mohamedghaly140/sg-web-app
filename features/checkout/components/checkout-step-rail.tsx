export type CheckoutStepRailProps = {
  steps: readonly { key: string; label: string }[];
  currentStep: string;
};

export function CheckoutStepRail({
  steps,
  currentStep,
}: CheckoutStepRailProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex gap-4 border-b border-border pb-3 text-[12px] tracking-[0.1em] uppercase">
        {steps.map((step, index) => {
          const completed = currentIndex >= 0 && index < currentIndex;
          const current = index === currentIndex;

          return (
            <li
              key={step.key}
              aria-current={current ? "step" : undefined}
              className={
                completed
                  ? "text-accent-strong"
                  : current
                    ? "border-b border-primary pb-0.5 text-accent-strong"
                    : "text-muted-foreground"
              }
            >
              <span className="figures">
                {String(index + 1).padStart(2, "0")}
              </span>{" "}
              {step.label}
              {completed ? " ✓" : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
