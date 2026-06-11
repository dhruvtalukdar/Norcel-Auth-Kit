/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Defense-in-depth against XSS. The starter kit is shadcn/ui-based
  // which already escapes by default, but CSP defends against third-
  // party widget / future-component regressions.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Next.js dev needs 'unsafe-eval' for HMR; production should drop it.
      process.env.NODE_ENV === "production"
        ? "script-src 'self' 'unsafe-inline'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  // HSTS: force HTTPS for 2 years. Production-only by default; opt in
  // with HSTS_ENABLED=true.
  ...(process.env.HSTS_ENABLED === "true"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  // Clickjacking defense.
  { key: "X-Frame-Options", value: "DENY" },
  // Block MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer leakage.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful features we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Standalone output is required for the production Dockerfile to
  // copy only the runtime files (not the entire `node_modules`).
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // argon2 is a native module; mark it external on the server.
  serverExternalPackages: ["argon2", "@prisma/client", "prisma"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
