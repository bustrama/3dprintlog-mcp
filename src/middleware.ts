import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Claude.ai uses Streamable HTTP transport and POSTs (and GETs/DELETEs) to
  // whatever URL the user entered. If they entered the base URL, rewrite all
  // MCP-relevant methods at / → /api/mcp so the handler picks them up.
  const method = req.method;
  if (
    req.nextUrl.pathname === "/" &&
    (method === "POST" || method === "GET" || method === "DELETE" || method === "OPTIONS")
  ) {
    return NextResponse.rewrite(new URL("/api/mcp", req.url));
  }
}

export const config = {
  matcher: ["/"],
};
