/**
 * ForgeStack — Auth Zod schemas.
 *
 * Single source of truth for input validation across:
 *   - server actions (`features/auth/actions.ts`)
 *   - API route handlers
 *   - client-side form components
 *
 * Strong-password rule: min 8 chars, 1 upper, 1 lower, 1 digit, 1 symbol.
 * Tweak `PASSWORD_REGEX` if your security team needs a stricter policy.
 */
import { z } from "zod";

export const PASSWORD_MIN = 8;
export const PASSWORD_REGEX = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /[0-9]/,
  symbol: /[^A-Za-z0-9]/,
};

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`)
  .max(128, "Password is too long.")
  .refine((v) => PASSWORD_REGEX.upper.test(v), {
    message: "Password must contain an uppercase letter.",
  })
  .refine((v) => PASSWORD_REGEX.lower.test(v), {
    message: "Password must contain a lowercase letter.",
  })
  .refine((v) => PASSWORD_REGEX.digit.test(v), {
    message: "Password must contain a digit.",
  })
  .refine((v) => PASSWORD_REGEX.symbol.test(v), {
    message: "Password must contain a symbol.",
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .max(254, "Email is too long.");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(80, "Name is too long.");

// ─── Sign up ───────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

// ─── Sign in ───────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});
export type SignInInput = z.infer<typeof signInSchema>;

// ─── Forgot / reset password ───────────────────────────────────────────────

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Magic link ────────────────────────────────────────────────────────────

export const magicLinkSchema = z.object({ email: emailSchema });
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

// ─── Profile update ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: nameSchema,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match.",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password.",
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
