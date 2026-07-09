import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * IconContainer — the 36×36 square icon chrome used in feature cards.
 * Defaults to the neutral white-tint treatment; pass `amber` for the
 * gift / offer accent variant.
 */
export function IconContainer({
  className,
  amber = false,
  children,
}: {
  className?: string;
  amber?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset",
        amber
          ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 ring-amber-500/20"
          : "border border-white/[0.08] bg-white/[0.04] text-zinc-300 ring-white/[0.04]",
        className
      )}
    >
      {children}
    </span>
  );
}
