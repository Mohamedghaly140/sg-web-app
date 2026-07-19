"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { LucideLoader2 } from "lucide-react";
import { cloneElement } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label?: string;
  className?: string;
  icon?: React.ReactElement<{
    className?: string;
    "data-icon"?: "inline-start" | "inline-end";
  }>;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
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
      {isLoading && (
        <LucideLoader2 data-icon="inline-start" className="animate-spin" />
      )}
      {label}
      {icon &&
        !isLoading &&
        cloneElement(icon, { "data-icon": "inline-start" })}
    </Button>
  );
};

export default SubmitButton;
