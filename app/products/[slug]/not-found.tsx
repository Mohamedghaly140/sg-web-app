import { LucideSearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<LucideSearchX className="size-6 text-muted-foreground" aria-hidden />}
        title="Product not found"
        description="This product may have been removed or is no longer available."
        action={<Button render={<Link href="/products" />}>Browse products</Button>}
      />
    </div>
  );
}
