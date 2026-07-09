"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button — dark-mode variants (readme/DESIGN_SYSTEM.md §5 / §1.1-1.4).
 *
 * - `primary`       : near-white pill (the canonical CTA on dark)
 * - `secondary`     : `bg-white/5` pill with `ring-1 ring-inset ring-white/10`
 * - `polarity`      : near-black pill (used inside a "featured" white card)
 * - `polarity-secondary` : near-white pill inside a dark featured card
 * - `primary-sm` / `secondary-sm` : nav-scale variants
 * - `ghost`         : subtle text button for nav rows / cards
 * - `link`          : inline link
 * - `destructive`   : error-tinted pill for destructive actions
 * - `outline`       : bordered ghost
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-white !text-black hover:bg-white/90 rounded-pill",
        secondary:
          "bg-white/[0.06] !text-white ring-1 ring-inset ring-white/[0.12] hover:bg-white/[0.10] hover:ring-white/20 rounded-pill",
        polarity:
          "bg-black !text-white rounded-pill hover:bg-black/90 ring-1 ring-inset ring-black/20",
        "polarity-secondary":
          "bg-white !text-black hover:bg-white/90 rounded-pill",
        "primary-sm":
          "bg-white !text-black hover:bg-white/90 rounded-pill",
        "secondary-sm":
          "bg-white/[0.06] !text-white ring-1 ring-inset ring-white/[0.12] hover:bg-white/[0.10] hover:ring-white/20 rounded-pill",
        ghost:
          "!text-zinc-300 hover:!text-white hover:bg-white/[0.06] rounded-md",
        link: "!text-zinc-300 underline-offset-4 hover:underline hover:!text-white",
        destructive:
          "bg-red-500 !text-white hover:bg-red-400 rounded-pill focus-visible:ring-red-500",
        outline:
          "border border-white/[0.16] bg-white/[0.02] !text-white hover:bg-white/[0.06] hover:border-white/20 rounded-md",
      },
      size: {
        sm: "h-8 px-2.5 text-button-md",
        md: "h-9 px-3 text-button-md",
        lg: "h-11 px-5 text-button-lg",
        xl: "h-12 px-6 text-button-lg",
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
