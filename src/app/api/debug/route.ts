import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Debug endpoint — reveals config health without leaking secrets.
 * Hit GET /api/debug to check if env vars are set correctly.
 * Hit POST /api/debug with {"token":"..."} to test token validation.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const encKey = process.env.ENCRYPTION_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Validate ENCRYPTION_KEY is a 64-char hex string (= 32 bytes for AES-256)
  const encKeyValid = /^[0-9a-f]{64}$/i.test(encKey);
  const jwtSecretSet = jwtSecret.length > 0;
  const appUrlSet = appUrl.length > 0;

  return NextResponse.json(
    {
      status: "ok",
      env: {
        JWT_SECRET: jwtSecretSet ? `set (${jwtSecret.length} chars)` : "MISSING",
        ENCRYPTION_KEY: encKeyValid
          ? "valid (64-char hex)"
          : encKey.length === 0
          ? "MISSING"
          : `INVALID — got ${encKey.length} chars, expected 64 hex chars`,
        NEXT_PUBLIC_APP_URL: appUrlSet ? appUrl : "MISSING",
      },
    },
    { headers: CORS }
  );
}

export async function POST(req: NextRequest) {
  let body: { token?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400, headers: CORS });
  }

  if (!body.token) {
    return NextResponse.json({ error: "missing token" }, { status: 400, headers: CORS });
  }

  // Test token validation inline (mirrors resolveApiKey)
  try {
    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(body.token, secret);

    if (typeof payload.enc !== "string") {
      return NextResponse.json(
        { valid: false, reason: "payload.enc missing or not a string", payload },
        { headers: CORS }
      );
    }

    // Try decrypt
    const { createDecipheriv } = await import("crypto");
    const encKey = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
    const buf = Buffer.from(payload.enc, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", encKey, iv);
    decipher.setAuthTag(tag);
    const apiKey = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");

    return NextResponse.json(
      {
        valid: true,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.slice(0, 4) + "****",
      },
      { headers: CORS }
    );
  } catch (e: unknown) {
    return NextResponse.json(
      {
        valid: false,
        error: e instanceof Error ? e.message : String(e),
      },
      { headers: CORS }
    );
  }
}
