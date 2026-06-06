/**
 * ForgeStack — Auth.js (NextAuth v5) configuration.
 *
 * Providers:
 *   - Credentials (email + password, hashed with argon2id)
 *   - Google OAuth
 *   - GitHub OAuth
 *   - Email / magic link (via our own email service)
 *
 * The session strategy is JWT (no DB round-trip per request) but the
 * session callback enriches the token with role information so RBAC checks
 * don't need a database hit on every request.
 *
 * Splitting the config:
 *   - `lib/auth.config.ts` is edge-safe (no Prisma, no Node crypto) and is
 *     imported by `middleware.ts`.
 *   - `lib/auth.ts` (this file) extends it with the Node-only providers +
 *     adapter. Server components / actions / route handlers use this.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/features/auth/password";
import { signInSchema } from "@/features/auth/schemas";
import { sendMagicLinkEmail } from "@/lib/email";
import { serverEnv } from "@/lib/env";
import { authConfig } from "@/lib/auth.config";

// ─── Module augmentation: add `role` to Session / JWT ────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// ─── Providers (Node-only — Prisma + bcrypt + Nodemailer) ────────────────

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = signInSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          passwordHash: true,
          emailVerified: true,
          role: { select: { name: true } },
        },
      });
      if (!user?.passwordHash) return null;

      const ok = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!ok) return null;

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        role: user.role?.name ?? UserRole.USER,
      };
    },
  }),
];

if (serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

if (serverEnv.GITHUB_CLIENT_ID && serverEnv.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    })
  );
}

// Magic link via Auth.js's Nodemailer provider, but using our email service.
providers.push(
  Nodemailer({
    id: "email",
    name: "Email",
    server: {
      host: serverEnv.SMTP_HOST ?? "smtp.example.com",
      port: Number(serverEnv.SMTP_PORT ?? 587),
      auth:
        serverEnv.SMTP_USER && serverEnv.SMTP_PASSWORD
          ? { user: serverEnv.SMTP_USER, pass: serverEnv.SMTP_PASSWORD }
          : undefined,
    },
    from: serverEnv.EMAIL_FROM,
    async sendVerificationRequest({ identifier: email, url }) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { name: true },
      });
      await sendMagicLinkEmail({
        to: email,
        name: user?.name ?? null,
        url,
      });
    },
  })
);

// ─── Compose the full config from the edge-safe base ─────────────────────

const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: serverEnv.AUTH_SECRET,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // First sign-in: copy id + role from User onto the JWT.
      if (user) {
        token.id = user.id as string;
        token.role =
          (user as { role?: UserRole }).role ??
          (await prisma.user
            .findUnique({
              where: { id: user.id as string },
              select: { role: { select: { name: true } } },
            })
            .then((u) => u?.role?.name ?? UserRole.USER));
      }

      // On `update()` from the client, refresh role from DB.
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: { select: { name: true } } },
        });
        if (fresh?.role) token.role = fresh.role.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
