"use client";

import * as React from "react";
import { magicLinkAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function MagicLinkForm() {
  const [state, formAction] = React.useActionState(magicLinkAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Check your inbox.">
        If an account exists for that email, a sign-in link is on its way. The
        link expires in 10 minutes.
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
        Email me a link
      </SubmitButton>
    </form>
  );
}
