"use client";

import { Monitor, Smartphone, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  revokeAllOtherSessionsAction,
  revokeSessionAction,
} from "@/features/auth/actions";

type SessionRow = {
  id: string;
  sessionId: string;
  userAgent: string | null;
  ip: string | null;
  city: string | null;
  country: string | null;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
};

function detectDevice(userAgent: string | null): {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
} {
  if (!userAgent) return { icon: Globe, label: "Unknown device" };
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("android")) {
    return { icon: Smartphone, label: "Mobile" };
  }
  if (ua.includes("ipad") || ua.includes("tablet")) {
    return { icon: Smartphone, label: "Tablet" };
  }
  return { icon: Monitor, label: "Desktop" };
}

function browserName(userAgent: string | null): string {
  if (!userAgent) return "Unknown browser";
  const ua = userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Browser";
}

function osName(userAgent: string | null): string {
  if (!userAgent) return "";
  const ua = userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS X")) return "macOS";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Linux")) return "Linux";
  return "";
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}

export function SessionsList({
  sessions,
  currentSessionId,
}: {
  sessions: SessionRow[];
  currentSessionId: string;
}) {
  if (sessions.length === 0) {
    return (
      <p className="text-body-sm text-body">
        No active sessions found. Sign out and back in to create one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-caption text-mute">
          The current device is highlighted.
        </p>
        <form action={revokeAllOtherSessionsAction}>
          <Button type="submit" variant="secondary" size="sm">
            Sign out everywhere else
          </Button>
        </form>
      </div>

      <ul className="divide-y divide-hairline">
        {sessions.map((s) => {
          const { icon: Icon, label: deviceLabel } = detectDevice(s.userAgent);
          const isCurrent = s.sessionId === currentSessionId;
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-sm bg-canvas-soft text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-body-sm-strong text-ink">
                    {browserName(s.userAgent)} on {osName(s.userAgent) || "Unknown OS"}
                    {" "}
                    <span className="text-body-sm text-mute">
                      ({deviceLabel})
                    </span>
                    {isCurrent ? (
                      <Badge variant="success" className="ml-2">
                        This device
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-caption text-mute">
                    {s.ip ? `${s.ip} · ` : ""}
                    Last active {formatRelative(s.lastSeenAt)}
                  </p>
                </div>
              </div>

              {isCurrent ? (
                <span className="text-caption text-mute">Current</span>
              ) : (
                <form action={revokeSessionAction}>
                  <input type="hidden" name="sessionId" value={s.sessionId} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    aria-label="Revoke session"
                  >
                    <Trash2 className="h-4 w-4" />
                    Revoke
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
