"use client";

import * as React from "react";
import {
  resendVerificationAction,
  type ActionState,
} from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ResendVerificationForm() {
  const [state, formAction] = React.useActionState(
    resendVerificationAction,
    initial
  );

  return (
    <form action={formAction} className="flex items-end gap-2" noValidate>
      <div className="flex-1">
        <Field
          label="Email"
          htmlFor="email"
          error={state.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Field>
      </div>
      <SubmitButton variant="secondary" pendingLabel="Sending…">
        Resend
      </SubmitButton>
      {state.ok ? (
        <Alert intent="success" className="ml-2">
          {state.message}
        </Alert>
      ) : null}
    </form>
  );
}
