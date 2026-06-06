import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — `badge-secondary` token: canvas-soft pill, caption typography.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 text-caption font-medium",
  {
    variants: {
      variant: {
        default: "bg-canvas-soft text-body",
        success: "bg-cyan-soft text-cyan-deep",
        error: "bg-error-soft text-error-deep",
        warning: "bg-warning-soft text-warning-deep",
        violet: "bg-violet-soft text-violet-deep",
        outline: "border border-hairline text-body",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
