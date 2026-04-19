import { NextRequest, NextResponse } from "next/server";
import { resolveApiKey } from "@/lib/session";
import { PrintLogClient } from "@/lib/printlog";
import { TOOLS, callTool } from "@/lib/tools";

export const runtime = "nodejs";

const SERVER_INFO = { name: "3dprintlog", version: "0.1.0" };
const CAPABILITIES = { tools: {} };

// CORS headers — required because Claude.ai is a browser-based client
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-Id",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

// WWW-Authenticate tells Claude.ai where to find the OAuth2 server
const WWW_AUTH = `Bearer realm="${process.env.NEXT_PUBLIC_APP_URL}", error="invalid_token"`;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function ok(id: string | number | null | undefined, result: unknown): NextResponse {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, result } satisfies JsonRpcResponse,
    { headers: CORS }
  );
}

function err(
  id: string | number | null | undefined,
  code: number,
  message: string
): NextResponse {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } } satisfies JsonRpcResponse,
    { status: code === -32600 ? 400 : code === -32601 ? 404 : 200, headers: CORS }
  );
}

async function authenticate(req: NextRequest): Promise<string | null> {
  // 1. Authorization header (Claude Code, curl, etc.)
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const resolved = await resolveApiKey(auth.slice(7));
    console.log("[mcp] auth via header:", resolved ? "ok" : "FAILED (invalid token)");
    return resolved;
  }
  // 2. Query param — browser EventSource API can't send custom headers,
  //    so Claude.ai passes the token as ?access_token= on the SSE GET request
  const token = req.nextUrl.searchParams.get("access_token");
  if (token) {
    const resolved = await resolveApiKey(token);
    console.log("[mcp] auth via query param:", resolved ? "ok" : "FAILED (invalid token)");
    return resolved;
  }
  console.log("[mcp] auth: no token provided");
  return null;
}

// ── POST — JSON-RPC messages ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = await authenticate(req);
  if (!apiKey) {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Unauthorized" } },
      { status: 401, headers: { ...CORS, "WWW-Authenticate": WWW_AUTH } }
    );
  }

  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return err(null, -32700, "Parse error");
  }

  const { id, method, params } = body;
  console.log("[mcp] method:", method, "id:", id);

  if (method === "initialize") {
    // Echo back the client's requested protocol version (spec §negotiation).
    // Claude.ai sends 2025-03-26 (or newer); we must not downgrade it.
    const requestedVersion =
      (params as { protocolVersion?: string } | undefined)?.protocolVersion ??
      "2025-03-26";
    const response = ok(id, {
      protocolVersion: requestedVersion,
      capabilities: CAPABILITIES,
      serverInfo: SERVER_INFO,
    });
    // Return a stateless session ID so the client can include it on follow-up
    // requests (Mcp-Session-Id). We use a random ID — no server-side storage
    // needed because our auth is fully token-based.
    response.headers.set(
      "Mcp-Session-Id",
      crypto.randomUUID().replace(/-/g, "")
    );
    return response;
  }

  if (method === "notifications/initialized") {
    // Notifications have no response — 202 Accepted per Streamable HTTP spec
    return new NextResponse(null, { status: 202, headers: CORS });
  }

  if (method === "tools/list") {
    return ok(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const { name, arguments: toolArgs } = params as {
      name: string;
      arguments: Record<string, unknown>;
    };
    if (!name) return err(id, -32602, "Missing tool name");

    const client = new PrintLogClient(apiKey);
    try {
      const result = await callTool(name, toolArgs ?? {}, client);
      return ok(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Tool execution failed";
      return ok(id, { content: [{ type: "text", text: message }], isError: true });
    }
  }

  return err(id, -32601, `Method not found: ${method}`);
}

// ── DELETE — session termination ─────────────────────────────────────────────

export async function DELETE() {
  // Clients MAY send DELETE to cleanly close their session (spec §session).
  // We're stateless, so just acknowledge.
  return new NextResponse(null, { status: 200, headers: CORS });
}

// ── GET — SSE stream (server-initiated messages / legacy SSE transport) ───────

export async function GET(req: NextRequest) {
  const apiKey = await authenticate(req);
  if (!apiKey) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { ...CORS, "WWW-Authenticate": WWW_AUTH },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  // If token came via query param, embed it in the POST endpoint URL too
  const qToken = req.nextUrl.searchParams.get("access_token");
  const postUrl = qToken
    ? `${appUrl}/api/mcp?access_token=${encodeURIComponent(qToken)}`
    : `${appUrl}/api/mcp`;
  const enc = new TextEncoder();

  let keepAlive: ReturnType<typeof setInterval>;
  const stream = new ReadableStream({
    start(controller) {
      // Required: tells the client where to POST JSON-RPC messages
      controller.enqueue(enc.encode(`event: endpoint\ndata: ${postUrl}\n\n`));
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(enc.encode(": ping\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15_000);
    },
    cancel() {
      clearInterval(keepAlive);
    },
  });

  return new NextResponse(stream, {
    headers: {
      ...CORS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
