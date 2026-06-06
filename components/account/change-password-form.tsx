"use client";

import * as React from "react";
import { changePasswordAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ChangePasswordForm() {
  const [state, formAction] = React.useActionState(changePasswordAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Password updated.">
        Your new password is active on your next sign-in.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      <Field
        label="Current password"
        htmlFor="currentPassword"
        error={state.fieldErrors?.currentPassword}
        required
      >
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        label="New password"
        htmlFor="newPassword"
        error={state.fieldErrors?.newPassword}
        required
      >
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Field
        label="Confirm new password"
        htmlFor="confirmNewPassword"
        error={state.fieldErrors?.confirmNewPassword}
        required
      >
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <div>
        <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
      </div>
    </form>
  );
}
