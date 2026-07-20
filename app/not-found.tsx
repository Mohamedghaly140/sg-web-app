import { LucideSearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <EmptyState
        icon={<LucideSearchX className="size-6 text-muted-foreground" />}
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={
          <Button render={<Link href="/" />} variant="outline" size="sm">
            Back to home
          </Button>
        }
      />
    </div>
  );
}
