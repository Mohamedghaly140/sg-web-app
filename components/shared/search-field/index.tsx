import { LucideSearch } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  className?: string;
  defaultValue?: string;
  name?: string;
};

export function SearchField({
  className,
  defaultValue,
  name,
}: SearchFieldProps) {
  return (
    <div className="relative">
      <LucideSearch className="pointer-events-none absolute left-[9px] top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name={name ?? "search"}
        placeholder="Search products..."
        aria-label="Search products"
        defaultValue={defaultValue}
        className={cn("pl-8", className)}
      />
    </div>
  );
}
