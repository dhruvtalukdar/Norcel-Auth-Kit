"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border bg-canvas-2 p-4 pr-8 shadow-elev-4 data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
  {
    variants: {
      variant: {
        default: "border-white/[0.08]",
        success: "border-emerald-500/40",
        error: "border-red-500/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-mute hover:text-white",
      className
    )}
    toast-close=""
    aria-label="Close"
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-body-sm-strong text-ink", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-body-sm text-zinc-300", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: VariantProps<typeof toastVariants>["variant"];
  duration?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PublicToast = Omit<ToasterToast, "id" | "open" | "onOpenChange">;

const listeners = new Set<(t: ToasterToast) => void>();

export function toast(t: PublicToast) {
  const id = Math.random().toString(36).slice(2);
  const toastObj: ToasterToast = {
    ...t,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        listeners.forEach((l) => l({ ...toastObj, open: false }));
      }
    },
  };
  listeners.forEach((l) => l(toastObj));
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  React.useEffect(() => {
    const handler = (t: ToasterToast) => {
      setToasts((prev) => {
        if (!t.open) {
          return prev.filter((p) => p.id !== t.id);
        }
        return [...prev, t];
      });
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <ToastProvider duration={4000} swipeDirection="right">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          duration={t.duration}
          open={t.open}
          onOpenChange={t.onOpenChange}
        >
          <div className="grid gap-1">
            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            {t.description ? (
              <ToastDescription>{t.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
