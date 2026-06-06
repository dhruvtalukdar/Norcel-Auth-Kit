"use client";

import * as React from "react";
import { resetPasswordAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = React.useActionState(resetPasswordAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Password updated.">
        <a href="/login" className="text-ink underline underline-offset-4">
          Continue to sign in
        </a>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <Field
        label="New password"
        htmlFor="password"
        error={state.fieldErrors?.password}
        description="At least 8 characters, with upper, lower, a number, and a symbol."
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Field
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
        required
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <SubmitButton pendingLabel="Updating…" className="w-full">
        Update password
      </SubmitButton>
    </form>
  );
}
