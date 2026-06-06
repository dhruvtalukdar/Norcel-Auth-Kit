import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Input — `form-input` token from DESIGN.md.
 * Height 40px, hairline border, 6px radius, body-sm typography.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border border-hairline bg-canvas px-3 text-body-sm text-ink",
          "placeholder:text-mute",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:border-ink",
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
