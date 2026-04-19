import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrintLogClient } from "@/lib/printlog";
import { createAuthCode } from "@/lib/session";
import { isRedirectUriAllowed } from "@/lib/redirect-allowlist";

export const runtime = "nodejs";

const Body = z.object({
  apiKey: z.string().min(1),
  clientId: z.string(),
  redirectUri: z.string().url(),
  state: z.string(),
  codeChallenge: z.string().min(43).max(128),
  codeChallengeMethod: z.string().default("S256"),
});

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
  }

  if (parsed.codeChallengeMethod !== "S256") {
    return NextResponse.json(
      { error: "Only S256 code_challenge_method is supported" },
      { status: 400 }
    );
  }

  // Validate redirect_uri against the static allowlist. This blocks
  // code-exfiltration attacks where an attacker crafts an authorize link
  // pointing at a host they control.
  if (!isRedirectUriAllowed(parsed.redirectUri)) {
    return NextResponse.json(
      { error: "redirect_uri is not registered for this client" },
      { status: 400 }
    );
  }

  // Validate the API key against 3dprintlog
  const client = new PrintLogClient(parsed.apiKey);
  const valid = await client.validate();
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid API key — could not authenticate with 3dprintlog." },
      { status: 401 }
    );
  }

  // Issue a self-contained auth code (5 min TTL, contains PKCE challenge)
  const code = await createAuthCode({
    apiKey: parsed.apiKey,
    codeChallenge: parsed.codeChallenge,
    redirectUri: parsed.redirectUri,
    clientId: parsed.clientId,
  });

  const redirectUrl = new URL(parsed.redirectUri);
  redirectUrl.searchParams.set("code", code);
  if (parsed.state) redirectUrl.searchParams.set("state", parsed.state);

  return NextResponse.json({ redirectUrl: redirectUrl.toString() });
}
