import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Alert — dark-mode feedback surface. Uses color-tinted hairline + faint
 * fill so it reads as a card on the dark canvas.
 */
type AlertIntent = "info" | "success" | "error" | "warning";

const styles: Record<AlertIntent, string> = {
  info: "bg-blue-500/[0.06] text-blue-200 border-blue-500/30",
  success: "bg-emerald-500/[0.06] text-emerald-200 border-emerald-500/30",
  error: "bg-red-500/[0.06] text-red-200 border-red-500/30",
  warning: "bg-amber-500/[0.06] text-amber-200 border-amber-500/30",
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
