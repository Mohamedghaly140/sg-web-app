import { LucideCircleAlert } from "lucide-react";
import Link from "next/link";

import { AccountDisabledCleanup } from "@/components/shared/account-disabled/account-disabled-cleanup";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { isAccountDisabled } from "@/lib/api/check-account-disabled";

export default async function AccountDisabledPage() {
  const shouldSignOut = await isAccountDisabled();

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <AccountDisabledCleanup shouldSignOut={shouldSignOut} />
      <EmptyState
        icon={<LucideCircleAlert className="size-6 text-muted-foreground" />}
        title="This account has been disabled"
        description="Please contact support if you believe this is a mistake."
        action={
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to home
          </Link>
        }
      />
    </div>
  );
}
