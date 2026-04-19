import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

// Dynamic Client Registration — RFC 7591
// Claude registers itself here before starting the authorization flow.
// We don't need to persist clients since our auth codes are self-contained JWTs.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body is optional per RFC 7591
  }

  const redirectUris: string[] = Array.isArray(body.redirect_uris)
    ? (body.redirect_uris as string[])
    : [];

  console.log("[register] client registration — redirect_uris:", redirectUris, "ua:", req.headers.get("user-agent"));

  const clientId = randomBytes(16).toString("hex");

  // RFC 7591 §3.2.1 — echo back all registered client metadata so the
  // client can verify its redirect_uris were accepted.
  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: body.client_name ?? "mcp-client",
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
