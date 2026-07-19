"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { LucideLoader2 } from "lucide-react";
import { cloneElement } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label?: string;
  className?: string;
  icon?: React.ReactElement<{ className?: string }>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
}

const SubmitButton = ({
  icon,
  className,
  label = "Submit",
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  const isLoading = pending || loading;

  return (
    <Button
      type="submit"
      size={size}
      variant={variant}
      disabled={pending || disabled}
      className={clsx(
        className,
        "pointer-events-auto",
        "disabled:cursor-not-allowed",
        { "cursor-wait": pending },
      )}
    >
      {isLoading && <LucideLoader2 className="w-4 h-4 animate-spin" />}
      {label}
      {icon && !isLoading && cloneElement(icon, { className: "w-4 h-4" })}
    </Button>
  );
};

export default SubmitButton;
