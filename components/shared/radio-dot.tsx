import { cn } from "@/lib/utils";

export type RadioDotProps = {
  selected: boolean;
  className?: string;
};

export function RadioDot({ selected, className }: RadioDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 rounded-full border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
        selected
          ? "border-primary bg-primary shadow-[inset_0_0_0_4px_var(--background)]"
          : "border-border",
        className,
      )}
    />
  );
}
