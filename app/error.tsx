"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">/ error</p>
      <h1 className="mt-3 text-display-lg text-ink">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-body-md text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="secondary">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
