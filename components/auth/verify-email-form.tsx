"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyEmailAction, type ActionState } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

/**
 * Submits the verification token to the server action exactly ONCE on
 * mount by rendering a real `<form>` with a hidden submit button and
 * calling `formRef.current?.requestSubmit()` inside an effect with an
 * empty dependency list.
 *
 * The previous implementation put `formAction` in the effect's deps,
 * which made React re-fire the action on every state change (because
 * `useActionState` returns a fresh action reference each render). That
 * produced a tight render → state-change → re-render loop, which in
 * turn tripped Chromium's `history.replaceState` quota.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction] = React.useActionState(verifyEmailAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const submittedRef = useRef(false);

  useEffect(() => {
    // Submit the hidden form exactly once, on mount.
    if (submittedRef.current) return;
    submittedRef.current = true;
    formRef.current?.requestSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.ok) {
      const t = setTimeout(() => router.push("/login?verified=1"), 1200);
      return () => clearTimeout(t);
    }
  }, [state.ok, router]);

  // Hidden form — `display: none` would hide it from a11y; keep it in
  // the DOM but off-screen so the submit still works.
  return (
    <>
      <form ref={formRef} action={formAction} className="sr-only" aria-hidden>
        <input type="hidden" name="token" value={token} />
        <button type="submit" tabIndex={-1}>
          Verify
        </button>
      </form>
      {state.ok ? (
        <Alert intent="success" title="Email verified.">
          Redirecting you to sign in…
        </Alert>
      ) : state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : (
        <Alert intent="info" title="Verifying your link…">
          One moment.
        </Alert>
      )}
    </>
  );
}
