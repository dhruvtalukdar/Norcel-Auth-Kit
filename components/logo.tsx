import { cn } from "@/lib/utils";

/**
 * ForgeStack logo — an "F" monogram in a black square, paired with the
 * wordmark. Uses the brand's monospace face for the wordmark to signal
 * "developer-first" the same way Vercel's does.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid h-6 w-6 place-items-center rounded-sm bg-ink font-mono text-caption-mono font-semibold text-on-primary"
      >
        F
      </span>
      <span className="font-mono text-body-sm-strong tracking-tight text-ink">
        ForgeStack
      </span>
    </div>
  );
}
