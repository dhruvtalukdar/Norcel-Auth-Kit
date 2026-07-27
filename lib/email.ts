/**
 * Norcel — Email service.
 *
 * Four providers, chosen at runtime via EMAIL_PROVIDER:
 *   - "console" — log the rendered email to stdout (default in dev)
 *   - "resend"  — Resend transactional API
 *   - "smtp"    — Nodemailer SMTP transport
 *   - "memory"  — record to an in-process array (for tests; never use in prod)
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

/**
 * Captured emails when EMAIL_PROVIDER=memory. Read by the test
 * suite; reset between tests with `clearInbox()`.
 */
const inbox: EmailPayload[] = [];

export function getInbox(): readonly EmailPayload[] {
  return inbox;
}

export function clearInbox(): void {
  inbox.length = 0;
}

export function getLastEmail(to?: string): EmailPayload | undefined {
  if (to) {
    return [...inbox].reverse().find((e) => e.to === to);
  }
  return inbox[inbox.length - 1];
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const provider = serverEnv.EMAIL_PROVIDER;

  if (provider === "console") {
    // Defang: refuse to run with the "console" provider in production
    // unless explicitly opted in. Without this, a misconfigured
    // production deployment would log every email (including
    // password-reset links) to stdout, where they end up in log
    // aggregators and are PII leaks.
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_CONSOLE_EMAIL_IN_PROD !== "true"
    ) {
      throw new Error(
        "EMAIL_PROVIDER=console is not allowed in production. " +
          "Set EMAIL_PROVIDER=resend (or smtp) and the corresponding " +
          "API key. To override (NOT recommended), set " +
          "ALLOW_CONSOLE_EMAIL_IN_PROD=true."
      );
    }
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

  if (provider === "memory") {
    inbox.push(payload);
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
    // Replies go to a monitored inbox so users can reply to
    // transactional emails and we get the thread.
    replyTo: "support@norcel.dev",
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

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string | null;
  dashboardUrl: string;
}) {
  const tpl = renderEmail("welcome", {
    name: opts.name,
    dashboardUrl: opts.dashboardUrl,
  });
  await sendEmail({
    to: opts.to,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}
