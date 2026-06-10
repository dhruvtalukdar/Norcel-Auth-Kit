"use client";

import * as React from "react";
import {
  requestEmailChangeAction,
  cancelEmailChangeFormAction,
  type ActionState,
} from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function EmailChangeForm({
  currentEmail,
  pendingEmail,
}: {
  currentEmail: string;
  pendingEmail: string | null;
}) {
  const [state, formAction] = React.useActionState(
    requestEmailChangeAction,
    initial
  );

  if (pendingEmail) {
    return (
      <div className="flex flex-col gap-3">
        <Alert intent="info" title="Verification email sent.">
          We sent a link to <strong>{pendingEmail}</strong>. Open it to
          confirm the change. Your current address ({currentEmail}) stays
          active until you do.
        </Alert>
        <form action={cancelEmailChangeFormAction}>
          <Button type="submit" variant="ghost" size="sm">
            Cancel pending change
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      {state.message && state.ok ? (
        <Alert intent="success">{state.message}</Alert>
      ) : null}
      <Field
        label="New email address"
        htmlFor="newEmail"
        error={state.fieldErrors?.newEmail}
        description={`Currently: ${currentEmail}`}
        required
      >
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <div>
        <SubmitButton pendingLabel="Sending link…">Send verification link</SubmitButton>
      </div>
    </form>
  );
}
