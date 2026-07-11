"use client";

import * as React from "react";
import { changePasswordAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ChangePasswordForm({
  hasPassword,
}: {
  /** True if the user already has a password (credentials sign-up).
   *  False for OAuth-only users, who are SETTING their first
   *  password. */
  hasPassword: boolean;
}) {
  const [state, formAction] = React.useActionState(changePasswordAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Password set.">
        {hasPassword
          ? "Your new password is active on your next sign-in."
          : "You can now sign in with email + password in addition to your OAuth provider."}
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      {hasPassword ? (
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
      ) : null}
      <Field
        label={hasPassword ? "New password" : "Choose a password"}
        htmlFor="newPassword"
        error={state.fieldErrors?.newPassword}
        description={
          hasPassword
            ? undefined
            : "Setting a password lets you sign in with email + password as a backup to your OAuth provider."
        }
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
        label={hasPassword ? "Confirm new password" : "Confirm password"}
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
        <SubmitButton pendingLabel="Saving…">
          {hasPassword ? "Update password" : "Set password"}
        </SubmitButton>
      </div>
    </form>
  );
}
