"use client";

import { useTransition } from "react";
import { oauthSignInAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

/**
 * OAuth cluster — Google, GitHub. Each button posts to a server action
 * that calls `signIn(provider)` from Auth.js.
 */
export function OAuthButtons({ next }: { next?: string }) {
  const [pending, startTransition] = useTransition();

  const trigger = (provider: string) => {
    const fd = new FormData();
    fd.set("provider", provider);
    if (next) fd.set("next", next);
    startTransition(() => {
      oauthSignInAction(fd);
    });
  };

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={pending}
        onClick={() => trigger("google")}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={pending}
        onClick={() => trigger("github")}
      >
        <GitHubIcon className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.42 9.42 0 0 1 12 7.07c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.21 10.21 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}
