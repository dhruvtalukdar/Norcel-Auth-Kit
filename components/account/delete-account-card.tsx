"use client";

import * as React from "react";
import {
  deleteAccountAction,
  type ActionState,
} from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

/**
 * "Danger zone" card. Hosts the soft-delete flow with a confirmation
 * step that requires the user to type their email before we proceed.
 */
export function DeleteAccountCard({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(deleteAccountAction, initial);

  if (!open) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-display-sm text-ink">Delete account.</p>
            <p className="mt-1 text-body-sm text-zinc-300">
              Permanently delete your Norcel account. This is a soft
              delete — your data is recoverable for a grace period, but
              you'll lose access immediately.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-6">
      <p className="text-display-sm text-ink">Are you absolutely sure?</p>
      <p className="mt-2 text-body-sm text-zinc-300">This will:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-body-sm text-zinc-300">
        <li>Revoke all your active sessions</li>
        <li>Invalidate any outstanding password-reset or email-change links</li>
        <li>Anonymise your email address</li>
        <li>Mark your account as deleted (recoverable by a super-admin)</li>
      </ul>
      <p className="mt-4 text-body-sm text-zinc-300">
        Type <strong className="font-mono">{email}</strong> below to confirm.
      </p>
      <form action={formAction} className="mt-4 flex flex-col gap-4" noValidate>
        {state.message && !state.ok ? (
          <Alert intent="error">{state.message}</Alert>
        ) : null}
        <Field
          label="Confirm your email"
          htmlFor="confirmationEmail"
          error={state.fieldErrors?.confirmationEmail}
          required
        >
          <Input
            id="confirmationEmail"
            name="confirmationEmail"
            type="email"
            autoComplete="off"
            required
            placeholder={email}
          />
        </Field>
        <div className="flex gap-3">
          <SubmitButton variant="destructive" pendingLabel="Deleting…">
            Permanently delete account
          </SubmitButton>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
