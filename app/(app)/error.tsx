"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the (app) segment — dashboard, profile, admin.
 *
 * Catches anything thrown inside (app)/layout.tsx (e.g. a transient
 * database connection drop) and renders a single, stable error surface.
 */
export default function AppError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
        / error
      </p>
      <h1 className="mt-3 text-display-md text-ink">
        We couldn't load this page.
      </h1>
      <p className="mt-3 max-w-md text-body-md text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/login">Sign in again</Link>
        </Button>
      </div>
    </div>
  );
}
