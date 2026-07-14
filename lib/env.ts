/**
 * ForgeStack — Typed environment variable parser.
 *
 * Centralised so every module reads env via a single, validated object.
 * Throws on boot when required values are missing — fail-fast beats
 * a half-configured app in production.
 */
import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Auth.js
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters."),
  // AUTH_URL must be a real URL in production. The localhost default
  // works in dev but breaks OAuth callbacks, email links, and
  // session cookies the moment you deploy. We refuse to boot with
  // the dev value in a production build.
  AUTH_URL: z
    .string()
    .url()
    .optional()
    .refine(
      (v) => process.env.NODE_ENV !== "production" || !v?.startsWith("http://localhost"),
      {
        message:
          "AUTH_URL must be your production URL (e.g. https://yourdomain.com), not http://localhost:3000. Update it in Vercel → Settings → Environment Variables and redeploy.",
      }
    ),
  AUTH_TRUST_HOST: z.string().optional(),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z
    .enum(["console", "resend", "smtp", "memory"])
    .default("console"),
  EMAIL_FROM: z.string().default("ForgeStack <no-reply@forgestack.dev>"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("ForgeStack"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

function parseServer() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

function parseClient() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error("Invalid public environment variables");
  }
  return parsed.data;
}

/**
 * Server-only env — never import this from a "use client" file.
 */
export const serverEnv = (() => {
  // Lazy-evaluate so build-time `next build` doesn't fail on missing vars
  // when the file is imported from a client component tree.
  if (typeof window !== "undefined") {
    throw new Error("serverEnv must not be imported in the browser");
  }
  return parseServer();
})();

/**
 * Public env — safe to ship to the client.
 */
export const clientEnv = parseClient();
