import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Only rewrite requests that look like MCP client traffic, not browser visits.
  // Browser requests have Accept: text/html — let those reach the landing page.
  const method = req.method;
  const accept = req.headers.get("accept") ?? "";
  const isBrowser = accept.includes("text/html");

  if (req.nextUrl.pathname === "/") {
    // POST / DELETE / OPTIONS at root are always MCP (browsers don't send these to /)
    if (method === "POST" || method === "DELETE" || method === "OPTIONS") {
      return NextResponse.rewrite(new URL("/api/mcp", req.url));
    }
    // GET at root: only rewrite for MCP clients (SSE or JSON, not browsers)
    if (method === "GET" && !isBrowser) {
      return NextResponse.rewrite(new URL("/api/mcp", req.url));
    }
  }
}

export const config = {
  matcher: ["/"],
};
