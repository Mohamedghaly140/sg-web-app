import type { CurrentUser } from "@/features/account/types/user";
import { formatMonthYear } from "@/lib/format";

type AccountGreetingProps = {
  user: CurrentUser;
  clerkName: string;
};

export function AccountGreeting({ user, clerkName }: AccountGreetingProps) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-baseline sm:justify-between">
      <h3 className="font-heading text-2xl font-normal text-foreground">
        Welcome back, {clerkName}
      </h3>
      <p className="text-xs text-muted-foreground sm:text-right">
        Member since {formatMonthYear(user.createdAt)}
      </p>
    </header>
  );
}
