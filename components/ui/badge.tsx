"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — dark-mode variants. All sit on `bg-{color}-500/10` and use a
 * `ring-1 ring-inset ring-{color}-500/30` border per the design system.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 text-caption font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.04] text-zinc-300 ring-white/[0.08]",
        success:
          "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
        error:
          "bg-red-500/10 text-red-300 ring-red-500/30",
        warning:
          "bg-amber-500/10 text-amber-300 ring-amber-500/30",
        violet:
          "bg-violet-500/10 text-violet-300 ring-violet-500/30",
        outline:
          "bg-transparent text-zinc-400 ring-white/[0.08]",
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
