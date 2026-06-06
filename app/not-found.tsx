import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-soft px-6 text-center">
      <p className="font-mono text-caption-mono uppercase text-mute">404</p>
      <h1 className="mt-3 text-display-lg text-ink">Page not found.</h1>
      <p className="mt-3 max-w-md text-body-md text-body">
        We couldn't find what you were looking for. The link may be broken or
        the page may have moved.
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
