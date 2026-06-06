"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Field — form field wrapper.
 * Renders a label, optional description, the control slot, and an error
 * message. Use `aria-describedby` from the input to wire it up.
 */
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  htmlFor: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ label, htmlFor, description, error, required, className, children, ...props }, ref) => {
    const errorId = `${htmlFor}-error`;
    const descriptionId = `${htmlFor}-description`;
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        <label
          htmlFor={htmlFor}
          className="text-body-sm-strong text-ink"
        >
          {label}
          {required ? <span className="text-error ml-0.5">*</span> : null}
        </label>
        {description ? (
          <p id={descriptionId} className="text-caption text-mute -mt-1">
            {description}
          </p>
        ) : null}
        {children}
        {error ? (
          <p id={errorId} role="alert" className="text-caption text-error-deep">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Field.displayName = "Field";
