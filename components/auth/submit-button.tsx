"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/**
 * Submit button that reads `pending` from the surrounding form's status.
 * Used inside a `<form action={...}>` so the spinner turns on while the
 * server action is running.
 */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
