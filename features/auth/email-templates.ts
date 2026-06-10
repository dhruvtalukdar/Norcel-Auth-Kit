/**
 * ForgeStack — Email templates.
 *
 * Pure functions returning `{ subject, html, text }`. No I/O, no network.
 * UI is a minimal, single-column HTML email that mirrors the Vercel / ForgeStack
 * brand: ink primary CTA, hairline borders, Geist font stack.
 *
 * Each template uses an absolute URL parameter so the same code works for
 * dev (localhost) and production.
 */

import { clientEnv } from "@/lib/env";

type RenderInput = {
  name: string | null;
  url: string;
};

const BRAND = clientEnv.NEXT_PUBLIC_APP_NAME;
const PRIMARY = "#171717";
const CANVAS = "#ffffff";
const CANVAS_SOFT = "#fafafa";
const HAIRLINE = "#ebebeb";
const BODY = "#4d4d4d";
const MUTE = "#888888";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)} — ${escapeHtml(BRAND)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CANVAS_SOFT};font-family:Geist,Inter,system-ui,-apple-system,sans-serif;color:${PRIMARY};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS_SOFT};padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${CANVAS};border:1px solid ${HAIRLINE};border-radius:12px;padding:40px;">
            <tr>
              <td>
                <p style="margin:0 0 32px;font-size:14px;font-weight:500;letter-spacing:-0.28px;color:${PRIMARY};">
                  ${escapeHtml(BRAND)}
                </p>
                ${body}
                <hr style="border:none;border-top:1px solid ${HAIRLINE};margin:40px 0 24px;" />
                <p style="margin:0;font-size:12px;line-height:16px;color:${MUTE};">
                  You received this email because you have an account on ${escapeHtml(BRAND)}.
                  If you didn't request this, you can safely ignore the message.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function cta(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
    <tr>
      <td style="background:${PRIMARY};border-radius:100px;">
        <a href="${escapeHtml(url)}"
           style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:500;line-height:24px;color:${CANVAS};text-decoration:none;border-radius:100px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function greeting(name: string | null): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:${BODY};">
    ${name ? `Hi ${escapeHtml(name)},` : "Hi there,"}
  </p>`;
}

function signature(): string {
  return `<p style="margin:32px 0 0;font-size:14px;line-height:20px;color:${BODY};">
    — The ${escapeHtml(BRAND)} team
  </p>`;
}

function fallbackLink(url: string): string {
  return `<p style="margin:16px 0 0;font-size:12px;line-height:16px;color:${MUTE};word-break:break-all;">
    Or copy and paste this URL into your browser:<br />
    <a href="${escapeHtml(url)}" style="color:${PRIMARY};text-decoration:underline;">${escapeHtml(url)}</a>
  </p>`;
}

// ─── Verification ──────────────────────────────────────────────────────────

function renderVerification({ name, url }: RenderInput) {
  const subject = `Verify your ${BRAND} email address`;
  const html = shell(
    subject,
    `
    ${greeting(name)}
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:32px;letter-spacing:-0.96px;color:${PRIMARY};">
      Verify your email.
    </h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:24px;color:${BODY};">
      Thanks for signing up for ${escapeHtml(BRAND)}. Tap the button below to
      confirm your email address — the link expires in 24 hours.
    </p>
    ${cta("Verify email", url)}
    ${fallbackLink(url)}
    ${signature()}
  `
  );
  const text = [
    `Hi ${name ?? "there"},`,
    ``,
    `Thanks for signing up for ${BRAND}. Confirm your email by opening:`,
    url,
    ``,
    `This link expires in 24 hours.`,
    ``,
    `— The ${BRAND} team`,
  ].join("\n");
  return { subject, html, text };
}

// ─── Password reset ────────────────────────────────────────────────────────

function renderPasswordReset({ name, url }: RenderInput) {
  const subject = `Reset your ${BRAND} password`;
  const html = shell(
    subject,
    `
    ${greeting(name)}
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:32px;letter-spacing:-0.96px;color:${PRIMARY};">
      Reset your password.
    </h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:24px;color:${BODY};">
      We received a request to reset the password for your ${escapeHtml(BRAND)} account.
      The link expires in 1 hour. If you didn't make this request, no changes
      will be made.
    </p>
    ${cta("Reset password", url)}
    ${fallbackLink(url)}
    ${signature()}
  `
  );
  const text = [
    `Hi ${name ?? "there"},`,
    ``,
    `We received a request to reset your ${BRAND} password. Open this link to choose a new one:`,
    url,
    ``,
    `The link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    ``,
    `— The ${BRAND} team`,
  ].join("\n");
  return { subject, html, text };
}

// ─── Magic link ────────────────────────────────────────────────────────────

function renderMagicLink({ name, url }: RenderInput) {
  const subject = `Your ${BRAND} sign-in link`;
  const html = shell(
    subject,
    `
    ${greeting(name)}
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:32px;letter-spacing:-0.96px;color:${PRIMARY};">
      Your sign-in link.
    </h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:24px;color:${BODY};">
      Click the button below to sign in to ${escapeHtml(BRAND)}. This link is
      single-use and expires in 10 minutes.
    </p>
    ${cta("Sign in", url)}
    ${fallbackLink(url)}
    ${signature()}
  `
  );
  const text = [
    `Hi ${name ?? "there"},`,
    ``,
    `Click this link to sign in to ${BRAND}:`,
    url,
    ``,
    `The link is single-use and expires in 10 minutes.`,
    ``,
    `— The ${BRAND} team`,
  ].join("\n");
  return { subject, html, text };
}

// ─── Email change ─────────────────────────────────────────────────────────

function renderEmailChange({ name, url }: RenderInput) {
  const subject = `Confirm your new ${BRAND} email address`;
  const html = shell(
    subject,
    `
    ${greeting(name)}
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:32px;letter-spacing:-0.96px;color:${PRIMARY};">
      Confirm your new email.
    </h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:24px;color:${BODY};">
      Someone (hopefully you) requested that this address become the new
      sign-in email for their ${escapeHtml(BRAND)} account. Tap the
      button below to confirm. The link expires in 1 hour.
    </p>
    <p style="margin:16px 0 8px;font-size:14px;line-height:20px;color:${MUTE};">
      If you didn't request this change, you can safely ignore this
      email — your current address will stay active.
    </p>
    ${cta("Confirm new email", url)}
    ${fallbackLink(url)}
    ${signature()}
  `
  );
  const text = [
    `Hi ${name ?? "there"},`,
    ``,
    `Someone (hopefully you) requested that this address become the new sign-in email for their ${BRAND} account. Open this link to confirm:`,
    url,
    ``,
    `The link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    ``,
    `— The ${BRAND} team`,
  ].join("\n");
  return { subject, html, text };
}

// ─── Public entry point ────────────────────────────────────────────────────

export type EmailTemplate =
  | "verification"
  | "password-reset"
  | "magic-link"
  | "email-change";

export function renderEmail(
  template: EmailTemplate,
  input: RenderInput
): { subject: string; html: string; text: string } {
  switch (template) {
    case "verification":
      return renderVerification(input);
    case "password-reset":
      return renderPasswordReset(input);
    case "magic-link":
      return renderMagicLink(input);
    case "email-change":
      return renderEmailChange(input);
  }
}
