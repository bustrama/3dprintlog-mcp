// Validates OAuth redirect_uri values (RFC 6749 §3.1.2.3).
//
// Strategy (stateless):
//   1. Must be https:// (or http://localhost for development).
//   2. Hostname must be in the static allowlist — Claude's MCP callback hosts.
//
// This blocks the "open-redirect via DCR" attack where an attacker registers a
// malicious redirect_uri and tricks a victim into delivering an auth code to
// an attacker-controlled host.

// Known public MCP clients. Conservative — add only hosts whose callback
// endpoints we've verified.
const ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  "claude.ai",
  "claude.com",
]);

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function isRedirectUriAllowed(redirectUri: string): boolean {
  let u: URL;
  try {
    u = new URL(redirectUri);
  } catch {
    return false;
  }

  if (u.protocol === "https:") {
    return ALLOWED_HOSTS.has(u.hostname);
  }
  // http:// only permitted for local development.
  if (u.protocol === "http:" && isLocalhost(u.hostname)) {
    return true;
  }
  return false;
}
