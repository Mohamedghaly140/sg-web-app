import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="relative h-[120px] w-[96px]">
        <div className="plate flex h-full w-full items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
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
