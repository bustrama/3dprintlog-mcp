import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthCode } from "@/lib/session";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function errorResponse(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  // Accept both application/json and application/x-www-form-urlencoded
  let params: Record<string, string> = {};
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      params = Object.fromEntries(new URLSearchParams(text));
    } else {
      params = await req.json();
    }
  } catch {
    return errorResponse("invalid_request", "Could not parse request body");
  }

  const { grant_type, code, redirect_uri, client_id, code_verifier } = params;

  if (grant_type !== "authorization_code") {
    return errorResponse("unsupported_grant_type", "Only authorization_code is supported");
  }
  if (!code) return errorResponse("invalid_request", "Missing code");
  if (!redirect_uri) return errorResponse("invalid_request", "Missing redirect_uri");
  if (!code_verifier) return errorResponse("invalid_request", "Missing code_verifier");

  console.log("[token] exchange attempt — redirect_uri:", redirect_uri, "client_id:", client_id);

  const accessToken = await exchangeAuthCode({
    code,
    codeVerifier: code_verifier,
    redirectUri: redirect_uri,
    clientId: client_id ?? "",
  });

  if (!accessToken) {
    console.log("[token] exchange FAILED — invalid grant or PKCE mismatch");
    return errorResponse("invalid_grant", "Auth code is invalid, expired, or PKCE failed", 400);
  }

  console.log("[token] exchange OK — token issued");

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 31_536_000, // 1 year
    },
    { headers: { ...CORS, "Cache-Control": "no-store" } }
  );
}
