import { cn } from "@/lib/utils";
import { LucideLoaderCircle } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className='flex justify-center items-center'>
      <LucideLoaderCircle className={cn("animate-spin", className)} />
    </div>
  );
};

export default Spinner;
