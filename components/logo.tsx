import { cn } from "@/lib/utils";

/**
 * ForgeStack logo — an "F" monogram in a near-white square, paired with
 * the wordmark in the same monospace face as the design system.
 *
 * On the dark canvas the mark is white (the brand CTA polarity).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid h-6 w-6 place-items-center rounded-md bg-white font-mono text-caption-mono font-semibold text-black"
      >
        F
      </span>
      <span className="font-mono text-body-sm-strong tracking-tight text-ink">
        ForgeStack
      </span>
    </div>
  );
}
