import { NextResponse } from "next/server";
import { appUrl } from "@/lib/app-url";

export const runtime = "nodejs";

// RFC 9728 — OAuth 2.0 Protected Resource Metadata
// Claude.ai checks this endpoint to discover how to authenticate with this resource.
export async function GET() {
  const base = appUrl();

  return NextResponse.json(
    {
      resource: base,
      authorization_servers: [base],
      bearer_methods_supported: ["header", "query"],
      resource_documentation: `${base}/api/mcp`,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    }
  );
}
