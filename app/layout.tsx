import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "ForgeStack — Build and deploy on the developer cloud.",
    template: "%s — ForgeStack",
  },
  description:
    "ForgeStack is a production-grade SaaS starter kit with authentication, RBAC, and a Vercel-inspired dark design system.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "ForgeStack",
    description:
      "Production-grade SaaS starter kit with auth, RBAC, and a polished design system.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <RevealOnScroll />
      </body>
    </html>
  );
}
