import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const user = await p.user.findUnique({
  where: { email: "user@forgestack.dev" },
  select: { id: true, email: true, deletedAt: true, lockedUntil: true },
});
if (!user) { console.log("user not found"); process.exit(1); }

// Manually issue a magic link (bypassing the email service)
const { issueMagicLinkToken } = await import("./features/auth/tokens.ts");
const token = await issueMagicLinkToken(user.id);
console.log("Issued token for", user.id, "token:", token.substring(0, 20) + "...");

// Now hit the magic callback
const res = await fetch(`http://localhost:3000/api/auth/magic/callback?token=${token}`, { redirect: "manual" });
console.log("Magic callback status:", res.status);
console.log("Location:", res.headers.get("location"));
const setCookies = res.headers.getSetCookie?.() ?? [];
console.log("Set-Cookie count:", setCookies.length);
for (const c of setCookies) {
  if (c.includes("session-token")) {
    console.log("session-token cookie SET (length", c.length, ")");
  }
}

await p.$disconnect();
