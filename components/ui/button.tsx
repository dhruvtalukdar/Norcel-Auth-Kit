"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — Vercel-derived variants.
 *
 * - `primary`  : black pill, marketing scale (button-primary)
 * - `secondary`: white pill with hairline border (button-secondary)
 * - `primary-sm`  / `secondary-sm` : nav-scale pills
 * - `ghost`    : subtle text button used inside cards / nav rows
 * - `link`     : inline link styled as text
 * - `destructive` : error-tinted pill for destructive actions
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-on-primary hover:bg-ink/90 rounded-pill focus-visible:ring-ink",
        secondary:
          "bg-canvas text-ink border border-hairline hover:bg-canvas-soft rounded-pill focus-visible:ring-ink",
        "primary-sm":
          "bg-ink text-on-primary hover:bg-ink/90 rounded-pill focus-visible:ring-ink",
        "secondary-sm":
          "bg-canvas text-ink border border-hairline hover:bg-canvas-soft rounded-pill focus-visible:ring-ink",
        ghost: "text-ink hover:bg-canvas-soft rounded-sm",
        link: "text-link underline-offset-4 hover:underline",
        destructive:
          "bg-error text-on-primary hover:bg-error-deep rounded-pill focus-visible:ring-error",
        outline:
          "border border-hairline bg-canvas hover:bg-canvas-soft text-ink rounded-sm",
      },
      size: {
        sm: "h-8 px-2 text-button-md",
        md: "h-9 px-3 text-button-md",
        lg: "h-11 px-4 text-button-lg",
        xl: "h-12 px-5 text-button-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
