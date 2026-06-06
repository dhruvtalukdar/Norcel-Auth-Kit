"use client";

import * as React from "react";
import { signUpAction, type ActionState } from "@/features/auth/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction] = React.useActionState(signUpAction, initial);

  if (state.ok) {
    return (
      <Alert intent="success" title="Check your inbox.">
        We sent a verification link to your email. Click the link to activate
        your account.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && !state.ok ? (
        <Alert intent="error">{state.message}</Alert>
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
          autoComplete="name"
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
          placeholder="Ada Lovelace"
        />
      </Field>

      <Field
        label="Work email"
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
        description="At least 8 characters, with upper, lower, a number, and a symbol."
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <Field
        label="Confirm password"
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
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
        />
      </Field>

      <label className="mt-2 flex items-start gap-2 text-body-sm text-body">
        <Checkbox name="terms" required className="mt-0.5" />
        <span>
          I agree to the{" "}
          <a href="/#terms" className="text-ink underline underline-offset-4">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/#privacy" className="text-ink underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      <SubmitButton pendingLabel="Creating account…" className="mt-2 w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
