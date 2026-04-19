import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

// Dynamic Client Registration — RFC 7591
// Claude registers itself here before starting the authorization flow.
// We don't need to persist clients since our auth codes are self-contained JWTs.
export async function POST(req: NextRequest) {
  try {
    await req.json(); // accept but don't require specific fields
  } catch {
    // body is optional
  }

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
