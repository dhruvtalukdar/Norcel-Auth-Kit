"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Opt out of the show/hide toggle for password fields. Defaults to false (toggle shown). */
  hidePasswordToggle?: boolean;
};

/**
 * Input — dark-mode `form-input` (readme/DESIGN_SYSTEM.md §10).
 * Height 40, hairline border, white/4 fill, white text, white/20 focus ring.
 *
 * When `type="password"`, an eye-icon toggle is appended inside the
 * input that flips the rendered type between `password` and `text`.
 * Set `hidePasswordToggle` to opt out (rare — only for confirm fields
 * or scripted flows where the user mustn't be able to read it back).
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hidePasswordToggle, ...props }, ref) => {
    const [revealed, setRevealed] = React.useState(false);
    const isPassword = type === "password" && !hidePasswordToggle;
    const effectiveType = revealed && isPassword ? "text" : type;

    return (
      <div className="relative">
        <input
          type={effectiveType}
          className={cn(
            "flex h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-body-sm text-white",
            isPassword && "pr-10",
            "placeholder:text-mute",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/[0.16]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            // Render the button only after hydration to avoid an
            // SSR/CSR mismatch (the icon's `aria-label` could differ
            // between server and client). We use a state flag rather
            // than `useEffect` so the button is interactive the moment
            // React hydrates the surrounding tree.
            suppressHydrationWarning
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-mute transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0"
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
