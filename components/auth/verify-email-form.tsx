"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyEmailAction, type ActionState } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

/**
 * Renders an invisible form that submits the token to the server action
 * on mount. Surfaces the success/failure as a styled alert.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction] = React.useActionState(verifyEmailAction, initial);
  const router = useRouter();

  useEffect(() => {
    const fd = new FormData();
    fd.set("token", token);
    formAction(fd);
  }, [token, formAction]);

  useEffect(() => {
    if (state.ok) {
      const t = setTimeout(() => router.push("/login?verified=1"), 1200);
      return () => clearTimeout(t);
    }
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <Alert intent="success" title="Email verified.">
        Redirecting you to sign in…
      </Alert>
    );
  }

  if (state.message && !state.ok) {
    return <Alert intent="error">{state.message}</Alert>;
  }

  return (
    <Alert intent="info" title="Verifying your link…">
      One moment.
    </Alert>
  );
}
