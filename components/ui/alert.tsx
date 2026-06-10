import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Alert — a single-purpose, semantic surface for form-action feedback.
 * Three intents: info, success, error.
 */
type AlertIntent = "info" | "success" | "error" | "warning";

const styles: Record<AlertIntent, string> = {
  info: "bg-link-bg-soft text-link-deep border-link/30",
  success: "bg-cyan-soft text-cyan-deep border-cyan-deep/30",
  error: "bg-error-soft text-error-deep border-error-deep/30",
  warning: "bg-warning-soft text-warning-deep border-warning-deep/30",
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  intent?: AlertIntent;
  title?: React.ReactNode;
}

export function Alert({
  className,
  intent = "info",
  title,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-4 py-3 text-body-sm",
        styles[intent],
        className
      )}
      {...props}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}
