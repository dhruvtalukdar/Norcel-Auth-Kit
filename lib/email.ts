/**
 * ForgeStack — Email service.
 *
 * Three providers, chosen at runtime via EMAIL_PROVIDER:
 *   - "console" — log the rendered email to stdout (default in dev)
 *   - "resend"  — Resend transactional API
 *   - "smtp"    — Nodemailer SMTP transport
 *
 * Templates live in `features/auth/email-templates.ts` and are pure strings
 * so they can be unit-tested without booting the network stack.
 */
import { serverEnv } from "@/lib/env";
import { renderEmail } from "@/features/auth/email-templates";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const provider = serverEnv.EMAIL_PROVIDER;

  if (provider === "console") {
    logToConsole(payload);
    return;
  }

  if (provider === "resend") {
    await sendViaResend(payload);
    return;
  }

  if (provider === "smtp") {
    await sendViaSmtp(payload);
    return;
  }

  throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
}

function logToConsole(payload: EmailPayload) {
  // Helpful divider so the dev can pick the link out of the terminal scroll.
  const divider = "─".repeat(64);
  console.log(`\n${divider}`);
  console.log(`📧 [email/console] → ${payload.to}`);
  console.log(`   subject: ${payload.subject}`);
  console.log(`${divider}`);
  console.log(payload.text);
  console.log(`${divider}\n`);
}

async function sendViaResend(payload: EmailPayload) {
  if (!serverEnv.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  }
  const { Resend } = await import("resend");
  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: serverEnv.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

async function sendViaSmtp(payload: EmailPayload) {
  if (!serverEnv.SMTP_HOST) {
    throw new Error("SMTP_HOST is required when EMAIL_PROVIDER=smtp");
  }
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: serverEnv.SMTP_HOST,
    port: Number(serverEnv.SMTP_PORT ?? 587),
    secure: serverEnv.SMTP_SECURE === "true",
    auth:
      serverEnv.SMTP_USER && serverEnv.SMTP_PASSWORD
        ? { user: serverEnv.SMTP_USER, pass: serverEnv.SMTP_PASSWORD }
        : undefined,
  });

  await transporter.sendMail({
    from: serverEnv.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

// ─── Re-exports — convenience used by the auth feature ─────────────────────

export async function sendVerificationEmail(opts: {
  to: string;
  name: string | null;
  url: string;
}) {
  const tpl = renderEmail("verification", { name: opts.name, url: opts.url });
  await sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string | null;
  url: string;
}) {
  const tpl = renderEmail("password-reset", { name: opts.name, url: opts.url });
  await sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  name: string | null;
  url: string;
}) {
  const tpl = renderEmail("magic-link", { name: opts.name, url: opts.url });
  await sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}
