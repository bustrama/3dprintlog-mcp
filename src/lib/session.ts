import { SignJWT, jwtVerify } from "jose";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function jwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

function encryptionKey(): Buffer {
  return Buffer.from(process.env.ENCRYPTION_KEY!, "hex");
}

// ── Access tokens (MCP bearer tokens) ────────────────────────────────────────

/** Issue a long-lived access token containing the encrypted API key. */
export async function createSession(apiKey: string): Promise<string> {
  const encryptedApiKey = encrypt(apiKey);
  return new SignJWT({ enc: encryptedApiKey })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1y")
    .sign(jwtSecret());
}

/** Resolve a bearer token → plain-text 3dprintlog API key, or null if invalid. */
export async function resolveApiKey(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    // Accept both access tokens (sub="access") and legacy tokens without sub
    if (typeof payload.enc !== "string") return null;
    return decrypt(payload.enc);
  } catch {
    return null;
  }
}

export async function revokeSession(_token: string): Promise<boolean> {
  // Stateless — rotate JWT_SECRET to invalidate all sessions at once.
  return true;
}

// ── OAuth2 PKCE auth codes ────────────────────────────────────────────────────

type AuthCodePayload = {
  sub: "auth_code";
  enc: string;       // encrypted API key
  cc: string;        // S256 code_challenge
  ru: string;        // redirect_uri
  ci: string;        // client_id
};

/**
 * Create a short-lived, self-contained auth code (signed JWT, 5 min TTL).
 * Contains the encrypted API key and PKCE challenge — no database needed.
 */
export async function createAuthCode(params: {
  apiKey: string;
  codeChallenge: string;
  redirectUri: string;
  clientId: string;
}): Promise<string> {
  const encryptedApiKey = encrypt(params.apiKey);
  return new SignJWT({
    sub: "auth_code",
    enc: encryptedApiKey,
    cc: params.codeChallenge,
    ru: params.redirectUri,
    ci: params.clientId,
  } satisfies AuthCodePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(jwtSecret());
}

/**
 * Exchange an auth code + PKCE verifier for a long-lived access token.
 * Returns null if the code is invalid, expired, or PKCE fails.
 */
export async function exchangeAuthCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
}): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(params.code, jwtSecret());

    if (payload.sub !== "auth_code") return null;
    if (typeof payload.enc !== "string") return null;
    if (typeof payload.cc !== "string") return null;
    if (typeof payload.ru !== "string") return null;

    // Validate redirect_uri matches
    if (payload.ru !== params.redirectUri) return null;

    // Validate PKCE: SHA256(code_verifier) must equal stored code_challenge
    const computed = createHash("sha256")
      .update(params.codeVerifier)
      .digest("base64url");
    if (computed !== payload.cc) return null;

    // All good — issue a long-lived access token
    const apiKey = decrypt(payload.enc);
    return createSession(apiKey);
  } catch {
    return null;
  }
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(data: string): string {
  const buf = Buffer.from(data, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
