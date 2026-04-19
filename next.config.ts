import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // OAuth 2.0 Authorization Server Metadata (RFC 8414)
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/oauth/metadata",
      },
      // OAuth 2.0 Protected Resource Metadata (RFC 9728) — Claude.ai checks this first
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/oauth/protected-resource",
      },
    ];
  },
  async headers() {
    return [
      { source: "/api/mcp", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
