"use client";

import * as React from "react";
import Link from "next/link";
import { signInAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = React.useActionState(signInAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
      ) : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}

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
          aria-invalid={Boolean(state.fieldErrors?.email)}
          placeholder="you@company.com"
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={state.fieldErrors?.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-body-sm text-body underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton pendingLabel="Signing in…" className="mt-2 w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
