import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  /** Semantic heading level for `title`. Defaults to a non-heading `p` so
   * this figure doesn't inject a level into a page's heading outline unless
   * the caller confirms it fits there. */
  titleAs?: "p" | "h3";
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  titleAs = "p",
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  const Title = titleAs;
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="relative h-[120px] w-[96px]">
        <div className="plate flex h-full w-full items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <Title
          className={
            titleAs === "h3"
              ? "font-heading text-2xl font-normal"
              : "text-sm font-medium"
          }
        >
          {title}
        </Title>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 max-w-[38ch]">
            {description}
          </p>
        )}
      </div>
      {secondaryAction ? (
        <div className="flex items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : (
        action
      )}
    </div>
  );
}
