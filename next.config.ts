import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

// Strict CSP for the API-key entry page — blocks injected script, framing, and
// exfiltration channels.
const AUTHORIZE_CSP =
  "default-src 'self'; " +
  // Next.js App Router emits inline hydration scripts; 'unsafe-inline' is
  // required for the page to render. XSS risk is bounded because the page
  // takes no user-controlled input that gets rendered into HTML.
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data:; " +
  "connect-src 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none'; " +
  "base-uri 'self'";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/.well-known/oauth-authorization-server", destination: "/api/oauth/metadata" },
      { source: "/.well-known/oauth-protected-resource", destination: "/api/oauth/protected-resource" },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/mcp",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/oauth/authorize",
        headers: [
          ...SECURITY_HEADERS,
          { key: "Cache-Control", value: "no-store" },
          { key: "Content-Security-Policy", value: AUTHORIZE_CSP },
        ],
      },
      {
        source: "/api/oauth/:path*",
        headers: [...SECURITY_HEADERS, { key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
