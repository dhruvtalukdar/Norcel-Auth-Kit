"use client";

import * as React from "react";
import { updateProfileAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function ProfileForm({
  defaultName,
  memberSince,
}: {
  defaultName: string;
  memberSince: Date;
}) {
  const [state, formAction] = React.useActionState(updateProfileAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      {state.message && state.ok ? (
        <Alert intent="success">{state.message}</Alert>
      ) : null}

      <Field
        label="Full name"
        htmlFor="name"
        error={state.fieldErrors?.name}
        required
      >
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          required
        />
      </Field>

      <p className="text-caption text-mute">
        Member since {memberSince.toLocaleDateString(undefined, { dateStyle: "long" })}.
      </p>

      <div>
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
