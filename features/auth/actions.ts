/**
 * ForgeStack — Server actions for auth flows.
 *
 * Each exported function is invoked by a client component via
 * `useActionState` / `<form action={...}>`. The shape returned from every
 * action is uniform so the UI can render errors in a single place.
 *
 *   { ok: boolean; message?: string; fieldErrors?: Record<string,string> }
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import { clientEnv } from "@/lib/env";
import {
  changePassword as changePasswordService,
  requestMagicLink as requestMagicLinkService,
  requestPasswordReset as requestPasswordResetService,
  resetPassword as resetPasswordService,
  resendVerificationEmail,
  signInWithPassword,
  signUpWithPassword,
  verifyEmailToken,
} from "@/features/auth/service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";
import { requireAuth } from "@/lib/auth-guards";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: Record<string, unknown>;
};

// ─── Sign up ───────────────────────────────────────────────────────────────

export async function signUpAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please review the highlighted fields.",
    };
  }

  const result = await signUpWithPassword(parsed.data);
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  return {
    ok: true,
    message: "Account created. Check your email to verify your address.",
  };
}

// ─── Sign in (email + password) ────────────────────────────────────────────

export async function signInAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please review the highlighted fields.",
    };
  }

  const verified = await signInWithPassword(parsed.data);
  if (!verified.ok) {
    return { ok: false, message: verified.error };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: false, message: "Could not start a session. Please try again." };
  }

  // Auth.js's signIn() doesn't redirect when redirect:false — handle it here.
  const next = sanitizeNext(formData.get("next"));
  redirect(next);
}

// ─── OAuth sign-in ─────────────────────────────────────────────────────────

export async function oauthSignInAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "");
  const next = sanitizeNext(formData.get("next"));
  await signIn(provider, { redirectTo: next });
}

// ─── Sign out ──────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

// ─── Forgot / reset password ───────────────────────────────────────────────

export async function forgotPasswordAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please enter a valid email address.",
    };
  }

  await requestPasswordResetService(parsed.data.email);
  return {
    ok: true,
    message:
      "If an account exists for that email, we've sent a reset link. Check your inbox.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please review the highlighted fields.",
    };
  }

  const result = await resetPasswordService({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  return { ok: true, message: "Password updated. You can now sign in." };
}

// ─── Magic link ────────────────────────────────────────────────────────────

export async function magicLinkAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please enter a valid email address.",
    };
  }

  await requestMagicLinkService(parsed.data.email);
  return {
    ok: true,
    message: "If an account exists for that email, a sign-in link is on its way.",
  };
}

// ─── Email verification ────────────────────────────────────────────────────

export async function verifyEmailAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  if (!token) {
    return { ok: false, message: "Missing verification token." };
  }

  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  return { ok: true, message: "Email verified. You can now sign in." };
}

export async function resendVerificationAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { ok: false, message: "Email is required." };
  }
  await resendVerificationEmail(email);
  return {
    ok: true,
    message: "If your address is unverified, we've sent a new link.",
  };
}

// ─── Profile ───────────────────────────────────────────────────────────────

export async function updateProfileAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth();
  const { updateProfileSchema } = await import("@/features/auth/schemas");
  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please review the highlighted fields.",
    };
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/profile");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodToFieldErrors(parsed.error),
      message: "Please review the highlighted fields.",
    };
  }

  const result = await changePasswordService({
    userId: session.user.id,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
  });
  if (!result.ok) {
    return { ok: false, message: result.error };
  }
  return { ok: true, message: "Password updated." };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function zodToFieldErrors(
  err: import("zod").ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Prevent open-redirect: only accept same-origin paths starting with `/`.
 */
function sanitizeNext(input: FormDataEntryValue | null): string {
  const fallback = "/dashboard";
  if (typeof input !== "string") return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  // Make sure the redirect target stays on our origin.
  try {
    const u = new URL(input, clientEnv.NEXT_PUBLIC_APP_URL);
    if (u.origin !== clientEnv.NEXT_PUBLIC_APP_URL) return fallback;
    return u.pathname + u.search;
  } catch {
    return fallback;
  }
}
