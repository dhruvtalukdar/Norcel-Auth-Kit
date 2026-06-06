import { redirect } from "next/navigation";

/**
 * Settings index — placeholder. The auth flows (password change, etc.)
 * live under /profile. Other settings tabs (security log, sessions,
 * notifications) can be added here.
 */
export default function SettingsPage() {
  redirect("/profile");
}
