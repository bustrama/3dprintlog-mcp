import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

// Dynamic Client Registration — RFC 7591
// Claude registers itself here before starting the authorization flow.
// We don't need to persist clients since our auth codes are self-contained JWTs.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }
  console.log("[register] new client registration — redirect_uris:", body.redirect_uris, "ua:", req.headers.get("user-agent"));

  const clientId = randomBytes(16).toString("hex");

  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
