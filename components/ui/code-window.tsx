import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * CodeWindow — developer-product surface (readme/DESIGN_SYSTEM.md §7).
 * The "this is a developer product" recipe: dark gradient, inset hairline,
 * heavy drop, traffic-light dots in the header, mono body.
 */
export function CodeWindow({
  filename,
  language = "TypeScript",
  className,
  children,
}: {
  filename?: string;
  language?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("code-window", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="code-dots">
          <span /><span /><span />
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          {filename ?? "forgestack / code"}
        </div>
        <div className="font-mono text-[11px] text-zinc-600">{language}</div>
      </div>
      <pre className="overflow-x-auto p-5 text-[12.5px] leading-[1.7] sm:p-6 sm:text-[13px] text-zinc-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}
