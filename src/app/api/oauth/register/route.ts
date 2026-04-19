import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

// Dynamic Client Registration — RFC 7591.
// We return a fresh client_id but do not persist registrations; the
// redirect_uri allowlist is enforced statically at the authorize endpoint.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isAcceptableRedirectUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    if (u.protocol === "https:") return true;
    if (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body is optional per RFC 7591
  }

  const rawUris: unknown = body.redirect_uris;
  const redirectUris: string[] = Array.isArray(rawUris)
    ? rawUris.filter((u): u is string => typeof u === "string" && isAcceptableRedirectUri(u))
    : [];

  const clientId = randomBytes(16).toString("hex");

  // RFC 7591 §3.2.1 — echo back only the URIs we'd accept at authorize time.
  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: typeof body.client_name === "string" ? body.client_name : "mcp-client",
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      code_challenge_methods_supported: ["S256"],
    },
    {
      status: 201,
      headers: CORS,
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
