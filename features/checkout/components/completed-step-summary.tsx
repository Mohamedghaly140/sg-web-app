import { Button } from "@/components/ui/button";

export type CompletedStepSummaryProps = {
  label: string;
  value: string;
  onChange: () => void;
};

export function CompletedStepSummary({
  label,
  value,
  onChange,
}: CompletedStepSummaryProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4">
      <div className="min-w-0">
        <p className="text-eyebrow">{label}</p>
        <p className="mt-1 text-sm">{value}</p>
      </div>
      <Button type="button" variant="ghost" onClick={onChange}>
        Change
      </Button>
    </div>
  );
}
