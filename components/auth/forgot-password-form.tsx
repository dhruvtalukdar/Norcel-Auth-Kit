"use client";

import * as React from "react";
import { forgotPasswordAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction] = React.useActionState(forgotPasswordAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Check your inbox.">
        If an account exists for that email, we've sent a password reset link.
        It expires in 1 hour.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      <Field
        label="Email"
        htmlFor="email"
        error={state.fieldErrors?.email}
        required
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </Field>
      <SubmitButton pendingLabel="Sending link…" className="w-full">
        Send reset link
      </SubmitButton>
    </form>
  );
}
