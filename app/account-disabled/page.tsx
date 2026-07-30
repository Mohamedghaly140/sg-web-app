import { LucideCircleAlert } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function AccountDisabledPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
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
