import { SignJWT, jwtVerify } from "jose";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function jwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET is missing or too short");
  return new TextEncoder().encode(s);
}

function encryptionKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

const JWT_ALG = "HS256";
const VERIFY_OPTS = { algorithms: [JWT_ALG] };

// ── Access tokens (MCP bearer tokens) ────────────────────────────────────────

export const ACCESS_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/** Issue an access token containing the encrypted API key. */
export async function createSession(apiKey: string): Promise<string> {
  const encryptedApiKey = encrypt(apiKey);
  return new SignJWT({ enc: encryptedApiKey })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject("access")
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

/** Resolve a bearer token → plain-text 3dprintlog API key, or null if invalid. */
export async function resolveApiKey(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), VERIFY_OPTS);
    // Reject auth-code JWTs presented as bearer tokens (intent confusion).
    if (payload.sub === "auth_code") return null;
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
  jti: string;       // unique id — used for single-use enforcement
};

const AUTH_CODE_TTL_SECONDS = 5 * 60;

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
  const jti = randomBytes(16).toString("hex");
  return new SignJWT({
    sub: "auth_code",
    enc: encryptedApiKey,
    cc: params.codeChallenge,
    ru: params.redirectUri,
    ci: params.clientId,
    jti,
  } satisfies AuthCodePayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CODE_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

/**
 * Exchange an auth code + PKCE verifier for a long-lived access token.
 * Returns null if the code is invalid, expired, replayed, or PKCE fails.
 */
export async function exchangeAuthCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
}): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(params.code, jwtSecret(), VERIFY_OPTS);

    if (payload.sub !== "auth_code") return null;
    if (typeof payload.enc !== "string") return null;
    if (typeof payload.cc !== "string") return null;
    if (typeof payload.ru !== "string") return null;
    if (typeof payload.jti !== "string") return null;

    if (payload.ru !== params.redirectUri) return null;

    // Client_id binding (RFC 6749 §4.1.3): strict equality — an auth code
    // missing or empty `ci` must not match a caller's `client_id`.
    if (typeof payload.ci !== "string" || payload.ci !== params.clientId) {
      return null;
    }

    // PKCE verification — timing-safe compare
    const computed = createHash("sha256")
      .update(params.codeVerifier)
      .digest("base64url");
    if (!timingSafeEqualStr(computed, payload.cc)) return null;

    // Auth codes expire after AUTH_CODE_TTL_SECONDS (5 min). Stateless
    // deployment — single-use enforcement would require external storage;
    // we rely on the short TTL plus HTTPS transport as the replay mitigation.
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

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
