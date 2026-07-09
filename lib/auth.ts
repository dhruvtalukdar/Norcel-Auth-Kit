/**
 * ForgeStack — Auth.js (NextAuth v5) configuration.
 *
 * Providers:
 *   - Credentials (email + password, hashed with argon2id)
 *   - Google OAuth
 *   - GitHub OAuth
 *   - Email / magic link (via our own email service)
 *
 * The session strategy is JWT. The JWT carries `{ id, role, sessionId }`
 * and is rotated by the `jwt` callback when it's more than 6 hours
 * old relative to its TTL. The `session` callback mirrors these onto
 * `session.user` for both the Node runtime and the edge runtime.
 *
 * Splitting the config:
 *   - `lib/auth.config.ts` is edge-safe (no Prisma, no Node crypto) and
 *     is imported by `middleware.ts`.
 *   - `lib/auth.ts` (this file) extends it with the Node-only providers
 *     + adapter + JWT/session callbacks. Server components / actions /
 *     route handlers use this.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
// Side-effect import for the JWT module so the augmentation block below
// resolves to a real module under TypeScript's `moduleResolution: "Bundler"`.
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/features/auth/password";
import { signInSchema } from "@/features/auth/schemas";
import {
  DEFAULT_SESSION_MS,
  REMEMBER_ME_SESSION_MS,
  shouldRotateJwt,
  startUserSession,
  touchUserSession,
} from "@/features/auth/sessions";
import { serverEnv } from "@/lib/env";
import { authConfig } from "@/lib/auth.config";

// ─── Module augmentation: extend Session / JWT / User ─────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      sessionId: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: UserRole;
    sessionId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    sessionId: string;
    iat: number;
    exp: number;
    rememberMe: boolean;
  }
}

// ─── Providers (Node-only — Prisma + argon2 + Nodemailer) ────────────────

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
          deletedAt: true,
          lockedUntil: true,
          role: { select: { name: true } },
        },
      });
      if (!user?.passwordHash) return null;
      if (user.deletedAt) return null;
      if (user.lockedUntil && user.lockedUntil > new Date()) return null;

      const ok = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!ok) return null;

      // Mint a new server-side session row.
      const { sessionId } = await startUserSession({ userId: user.id, rememberMe: false });

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        role: user.role?.name ?? UserRole.USER,
        sessionId,
      };
    },
  }),
];

if (serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      // Note: `allowDangerousEmailAccountLinking` is intentionally NOT
      // set. With it true, an attacker who controls an OAuth
      // provider's verified email (e.g. via a phishing-driven sign-up
      // to a third-party OAuth IdP) could merge their identity into a
      // victim's existing local account. We require the OAuth user to
      // sign in with the local-account password first to link.
    })
  );
}

if (serverEnv.GITHUB_CLIENT_ID && serverEnv.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
      // See note above re: `allowDangerousEmailAccountLinking`.
    })
  );
}

// Note: we previously registered Auth.js's Nodemailer provider here for
// the magic-link flow. That has been replaced by a self-contained flow
// in `app/api/auth/magic/callback/route.ts` which mints its own JWE
// session cookie. Reasons: (a) the Nodemailer provider's
// `getUserByEmail(identifier)` was creating a security/UX problem
// (account takeover if a non-email identifier was used), and (b) we
// can now store magic-link tokens as SHA-256 fingerprints in our own
// table, separate from Auth.js's `VerificationToken` namespace.

// ─── Compose the full config from the edge-safe base ─────────────────────

const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: serverEnv.AUTH_SECRET,
  // Default session length; the `jwt` callback can shorten this for
  // "remember me = false" flows.
  session: { strategy: "jwt", maxAge: REMEMBER_ME_SESSION_MS / 1000 },
  providers,
  callbacks: {
    ...authConfig.callbacks,

    /**
     * `signIn` is called by Auth.js after a successful provider
     * authentication but BEFORE the session cookie is set. We use
     * it as a gate to refuse sign-in for soft-deleted accounts.
     *
     * Without this guard, a user who soft-deleted their account
     * could sign in again with the same OAuth provider (e.g. Google
     * or GitHub) and Auth.js would re-link the same `Account` row
     * to the soft-deleted user — putting them in a confusing state
     * where the JWT says "signed in" but every protected page
     * redirects to `/login?error=account_deleted` because the
     * page-level `getDbSession()` finds `deletedAt` is set.
     *
     * For credentials sign-in, the `authorize` callback already
     * refuses soft-deleted users (it returns null), so this
     * callback is only the safety net for OAuth.
     *
     * IMPORTANT: this callback runs in **either** of two orderings:
     *   (a) The user is *new* — the adapter will create them AFTER
     *       we return true. In this case `user.id` is empty / a
     *       placeholder, and `user.email` is the only stable key.
     *   (b) The user is *existing* — `user.id` is the real id.
     *
     * We therefore look up by email (always present) instead of by
     * id. A missing row means the user hasn't been created yet
     * (we're in case a), which is fine — we let it through and
     * the adapter will create them. A row with `deletedAt` set
     * means case (b) with a soft-deleted account, which we refuse.
     */
    async signIn({ user, account }) {
      if (!user?.email) return true; // no email = can't gate; allow
      if (account?.provider === "credentials") return true; // already gated in authorize

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, deletedAt: true, lockedUntil: true },
      });
      // Case (a): user doesn't exist yet — adapter will create them.
      if (!dbUser) return true;
      // Case (b): user exists. Apply the soft-delete / lockout gate.
      if (dbUser.deletedAt) return false;
      if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
        return false;
      }
      return true;
    },

    /**
     * `jwt` runs on every request that touches a session. We:
     *   - On first sign-in, copy `id`, `role`, `sessionId` from the User.
     *   - On every subsequent call, validate the sessionId against the
     *     `UserSession` table (so revocations propagate immediately).
     *   - On `update()` (the client calling `useSession().update()`),
     *     refresh role from the DB.
     *   - Rotate the JWT if it's more than half-way through its TTL.
     *
     * The "force re-auth" return value: when the sessionId is no longer
     * valid we return an empty object, which Auth.js treats as "no
     * session" and redirects the user to /login.
     */
    async jwt({ token, user, trigger }) {
      // First sign-in: copy id, role, sessionId from the User record.
      // Credentials sets all three in `authorize`. OAuth/email goes
      // through the adapter, which only returns the base User fields —
      // so for those providers we re-read the DB row to pick up the
      // role (and any sessionId the `events.signIn` handler just minted).
      if (user) {
        token.id = user.id as string;
        const passedRole = (user as { role?: UserRole }).role;
        const passedSessionId = (user as { sessionId?: string }).sessionId;
        if (passedRole) {
          token.role = passedRole;
          token.sessionId = passedSessionId ?? "";
        } else {
          const fresh = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: { select: { name: true } } },
          });
          token.role = fresh?.role?.name ?? UserRole.USER;
          token.sessionId = passedSessionId ?? "";
        }
        token.rememberMe = false;
        return token;
      }

      // Subsequent calls: validate the sessionId is still active.
      if (token.sessionId) {
        const valid = await touchUserSession(token.sessionId);
        if (!valid) {
          // Session revoked or expired — return an empty token so the
          // user is forced through /login.
          return {} as typeof token;
        }
      }

      // On `update()`, refresh role from the DB.
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            role: { select: { name: true } },
            deletedAt: true,
            lockedUntil: true,
          },
        });
        if (fresh?.deletedAt) return {} as typeof token;
        if (fresh?.lockedUntil && fresh.lockedUntil > new Date()) {
          return {} as typeof token;
        }
        if (fresh?.role) token.role = fresh.role.name;
      }

      // JWT refresh-token rotation. Auth.js exposes the iat/exp as
      // seconds, not ms, so we convert.
      const iatMs = (token.iat ?? 0) * 1000;
      const ttlMs = token.rememberMe
        ? REMEMBER_ME_SESSION_MS
        : DEFAULT_SESSION_MS;
      if (iatMs && shouldRotateJwt(iatMs, ttlMs)) {
        // Bump iat so the cookie TTL is effectively extended.
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },

    /**
     * Mirror `id`, `role`, `sessionId` from the JWT onto `session.user`.
     * Runs in both the edge and Node runtimes (Auth.js's wrapper calls
     * it in both). Keep this lightweight — no DB calls.
     */
    async session({ session, token }) {
      if (token && session.user) {
        if (typeof token.id === "string") session.user.id = token.id;
        if (token.role) session.user.role = token.role;
        if (typeof token.sessionId === "string")
          session.user.sessionId = token.sessionId;
      }
      return session;
    },
  },
  events: {
    /**
     * Fires after a successful sign-in (any provider). Two reasons we
     * hook it:
     *
     *   1. OAuth providers (Google, GitHub) only return a verified
     *      email, but Auth.js doesn't auto-set `emailVerified`. We do
     *      it here so `requireVerified()` works for OAuth users on
     *      their very first sign-in.
     *
     *   2. We record a `LOGIN_SUCCESS` SecurityEvent and mint a
     *      UserSession row (the credentials provider does this itself
     *      in its `authorize` callback, but OAuth goes through the
     *      adapter and never hits that code path).
     */
    async signIn({ user, account }) {
      if (!user?.id) return;

      // Mark email as verified for OAuth users. Auth.js's adapter
      // doesn't auto-populate `emailVerified` even when the OAuth
      // provider returns a verified email, so we do it here.
      if (account?.provider !== "credentials") {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }

      // Mint a server-side UserSession row for the OAuth / email flow.
      // (The credentials provider already did this in its `authorize`
      // callback.) The sessionId is stashed on the User object passed
      // in here so the immediately-following `jwt` callback can pick
      // it up and write it into the JWT claims.
      if (account?.provider && account.provider !== "credentials") {
        const { startUserSession } = await import("@/features/auth/sessions");
        const { sessionId } = await startUserSession({
          userId: user.id,
          rememberMe: false,
        });
        (user as { sessionId?: string }).sessionId = sessionId;
      }
    },

    /**
     * Fires when a user signs out. We revoke the server-side session
     * row so the cookie is immediately useless.
     */
    async signOut(message) {
      // For JWT strategy the message is `{ token }`. We mirror `id` and
      // `sessionId` from the token claims onto the UserSession row.
      if ("token" in message && message.token) {
        const t = message.token as { id?: unknown; sessionId?: unknown };
        const userId = typeof t.id === "string" ? t.id : undefined;
        const sessionId =
          typeof t.sessionId === "string" && t.sessionId ? t.sessionId : undefined;
        if (sessionId && userId) {
          await prisma.userSession.updateMany({
            where: { sessionId, userId },
            data: { revokedAt: new Date() },
          });
        }
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
