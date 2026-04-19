import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 400 });
  }

  const revoked = await revokeSession(auth.slice(7));
  if (!revoked) {
    return NextResponse.json({ error: "Session not found or already revoked" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
