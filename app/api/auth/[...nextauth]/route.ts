/**
 * ForgeStack — Auth.js route handlers.
 * Exposes /api/auth/* (sign-in, callback, session, csrf, etc.).
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
