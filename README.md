# 3dprintlog MCP for Claude

Connect Claude to your [3dprintlog](https://www.3dprintlog.com) account. Ask Claude to log prints, check filament inventory, track maintenance, and more — in plain English.

## Connect in 3 steps

1. Open **[Claude.ai](https://claude.ai) → Settings → Connectors → Add custom connector**
2. Enter this URL:
   ```
   https://3dprintlog-mcp.vercel.app
   ```
3. A login page will open — paste your **[3dprintlog API key](https://www.3dprintlog.com/api-keys)** and click Authorise

That's it. Claude now has access to your 3dprintlog data.

---

## What you can ask Claude

**Prints**
> "Log a new print — Benchy, 2h 15m, 18g of eSUN PLA+ Black, success"
> "Show me my last 10 prints"
> "What prints have I done on my Bambu X1C?"

**Filaments**
> "How much filament do I have left in total?"
> "Add a new spool — Polymaker PolyTerra PLA, Muted White, 1kg"
> "Which filaments are running low?"

**Printers**
> "List all my printers"
> "Add my new Bambu A1 Mini"

**Maintenance**
> "Log a nozzle clean on my Prusa MK4"
> "When did I last do maintenance on the X1C?"
> "Show all upcoming maintenance tasks"

**Stats & feed**
> "What have I been printing lately?"
> "Give me a summary of this week's prints"

---

## Revoking access

To disconnect Claude, either:
- Remove the connector in **Claude.ai → Settings → Connectors**
- Or rotate your API key at [3dprintlog.com/api-keys](https://www.3dprintlog.com/api-keys) — this immediately invalidates all tokens

---

## Self-hosting

See [CLAUDE.md](./CLAUDE.md) for architecture details, environment variables, and deployment instructions.
