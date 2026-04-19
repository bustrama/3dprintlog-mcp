# 3dprintlog MCP Server

Remote MCP server that connects Claude to the [3dprintlog](https://www.3dprintlog.com) API. Deployed on Vercel, supports multi-tenant OAuth2 (PKCE) so any 3dprintlog user can connect via Claude.ai custom connectors.

## Architecture

- **Transport**: MCP Streamable HTTP (2025-03-26+), single `/api/mcp` endpoint
- **Auth**: OAuth2 Authorization Code + PKCE — no database, API key lives AES-256-GCM encrypted inside a signed JWT
- **Runtime**: Next.js App Router, Node.js serverless functions on Vercel

```
POST /          → middleware rewrites → /api/mcp   (MCP JSON-RPC)
GET  /          → middleware rewrites → /api/mcp   (SSE stream, legacy)
/.well-known/oauth-authorization-server → /api/oauth/metadata
/.well-known/oauth-protected-resource   → /api/oauth/protected-resource
/oauth/authorize                        → React page (API key entry UI)
/api/oauth/register                     → Dynamic client registration
/api/oauth/token                        → Token exchange
/api/debug                              → Health check (env var validation)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/mcp/route.ts` | MCP endpoint — handles initialize, tools/list, tools/call |
| `src/lib/tools.ts` | 30 MCP tool definitions (Prints, Filaments, Printers, Maintenance, etc.) |
| `src/lib/printlog.ts` | 3dprintlog REST API client |
| `src/lib/session.ts` | JWT issuance, AES-256-GCM encrypt/decrypt, PKCE auth codes |
| `src/app/oauth/authorize/page.tsx` | Browser UI — user pastes their API key here |
| `src/middleware.ts` | Rewrites root-path requests to /api/mcp |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | 64-char secret for signing JWTs (any strong random string) |
| `ENCRYPTION_KEY` | 64-char hex string = 32-byte AES-256 key (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Production URL, e.g. `https://3dprintlog-mcp.vercel.app` |

Generate keys:
```bash
openssl rand -hex 32   # ENCRYPTION_KEY
openssl rand -base64 48 # JWT_SECRET
```

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in the three vars above
npm run dev
```

## Deploying to Vercel

```bash
npm i -g vercel
vercel env add JWT_SECRET
vercel env add ENCRYPTION_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel deploy --prod
```

## Connecting via Claude.ai

1. Go to **Claude.ai → Settings → Connectors → Add**
2. Enter `https://3dprintlog-mcp.vercel.app`
3. Complete OAuth — paste your [3dprintlog API key](https://www.3dprintlog.com/api-keys) when prompted
4. Done — Claude can now read/write your prints, filaments, printers, and maintenance logs

## Available Tools

Tools cover the full 3dprintlog API surface:

- **Prints** — list, get, create, update, delete, list by printer/filament
- **Filaments** — list, get, create, update, delete; get inventory summary
- **Printers** — list, get, create, update, delete
- **Maintenance** — list, get, create, update, delete
- **Notifications** — list unread, mark read
- **Feed** — get activity feed
- **Reference data** — materials, colors, print statuses, manufacturers

## OAuth Flow (how it works)

```
Claude.ai backend          Our server              User browser
──────────────────         ──────────────          ─────────────
POST /api/mcp ──────────→  401 + WWW-Authenticate
  (no token)               (resource_metadata)
                           ↓
GET /.well-known/* ──────→ OAuth metadata
POST /api/oauth/register → client_id (+ redirect_uris echoed back)
                                                   Open /oauth/authorize
                                                   User enters API key
                                                   POST /api/oauth/authorize
                                                     → validates key
                                                     → issues auth code JWT
                                                   Redirect → claude.ai/callback
POST /api/oauth/token ───→ exchange code + PKCE
                           → access token (JWT with encrypted key)
POST /api/mcp ──────────→  decrypt key, call 3dprintlog, return result
  (Bearer token)
```

## Security Notes

- API keys are never stored server-side — they live encrypted inside the bearer token that Claude.ai holds
- Rotate your 3dprintlog API key to immediately revoke all Claude access
- `JWT_SECRET` rotation invalidates all issued tokens (users must re-auth)
- The `/api/debug` endpoint reveals env var health (valid/invalid) but never the actual values — **remove it before a public release**
