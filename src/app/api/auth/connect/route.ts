import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrintLogClient } from "@/lib/printlog";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";

const Body = z.object({
  apiKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "apiKey is required" }, { status: 400 });
  }

  const client = new PrintLogClient(parsed.apiKey);
  const valid = await client.validate();
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid API key — could not authenticate with 3dprintlog." },
      { status: 401 }
    );
  }

  const sessionToken = await createSession(parsed.apiKey);
  return NextResponse.json({ token: sessionToken });
}
