"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — dark-mode `form-input` (readme/DESIGN_SYSTEM.md §10).
 * Height 40, hairline border, white/4 fill, white text, white/20 focus ring.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-body-sm text-white",
          "placeholder:text-mute",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/[0.16]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
