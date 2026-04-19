export default function Home() {
  return (
    <div style={s.root}>
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav style={s.nav}>
        <span style={s.navLogo}>🖨️ 3dprintlog MCP</span>
        <div style={s.navLinks}>
          <a href="https://www.3dprintlog.com/api-keys" target="_blank" rel="noopener noreferrer" style={s.navLink}>
            Get API Key
          </a>
          <a href="https://github.com/bustrama/3dprintlog-mcp" target="_blank" rel="noopener noreferrer" style={s.navLinkGhost}>
            GitHub
          </a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.badge}>Model Context Protocol</div>
        <h1 style={s.heroTitle}>
          Control your 3D prints<br />
          <span style={s.heroAccent}>with plain English</span>
        </h1>
        <p style={s.heroSub}>
          Connect Claude to your 3dprintlog account. Log prints, track filaments,
          schedule maintenance — just by asking.
        </p>
        <div style={s.heroCtas}>
          <a
            href="https://claude.ai/settings/integrations"
            target="_blank"
            rel="noopener noreferrer"
            style={s.ctaPrimary}
          >
            Add to Claude.ai →
          </a>
          <a
            href="https://github.com/bustrama/3dprintlog-mcp"
            target="_blank"
            rel="noopener noreferrer"
            style={s.ctaSecondary}
          >
            View on GitHub
          </a>
        </div>
        <p style={s.heroHint}>
          Free · No account needed · Works with Claude.ai &amp; Claude Code
        </p>
      </section>

      {/* ── Steps ─────────────────────────────────────────── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Up and running in 3 steps</h2>
        <div style={s.steps}>
          {[
            { n: "1", title: "Open Claude.ai settings", body: "Go to Settings → Integrations → Add custom integration." },
            { n: "2", title: "Paste the server URL", body: "Enter https://3dprintlog-mcp.vercel.app and click Connect." },
            { n: "3", title: "Authorise with your API key", body: "A login page opens — paste your 3dprintlog API key and click Authorise." },
          ].map((step) => (
            <div key={step.n} style={s.step}>
              <div style={s.stepNum}>{step.n}</div>
              <div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepBody}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section style={{ ...s.section, background: "#0d0d0d" }}>
        <h2 style={s.sectionTitle}>Everything in one place</h2>
        <div style={s.grid}>
          {features.map((f) => (
            <div key={f.title} style={s.card}>
              <div style={s.cardIcon}>{f.icon}</div>
              <div style={s.cardTitle}>{f.title}</div>
              <div style={s.cardBody}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prompts ───────────────────────────────────────── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Ask Claude anything about your prints</h2>
        <div style={s.prompts}>
          {prompts.map((p) => (
            <div key={p} style={s.prompt}>
              <span style={s.promptQuote}>"</span>{p}<span style={s.promptQuote}>"</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security callout ──────────────────────────────── */}
      <section style={{ ...s.section, background: "#0d0d0d" }}>
        <div style={s.securityBox}>
          <div style={s.securityIcon}>🔒</div>
          <div>
            <div style={s.securityTitle}>Your API key never touches our servers</div>
            <div style={s.securityBody}>
              It's encrypted with AES-256 and packed inside a signed token that only Claude holds.
              Rotate your 3dprintlog API key at any time to immediately revoke access.
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={s.footer}>
        <span style={s.footerLogo}>🖨️ 3dprintlog MCP</span>
        <div style={s.footerLinks}>
          <a href="https://www.3dprintlog.com" target="_blank" rel="noopener noreferrer" style={s.footerLink}>3dprintlog.com</a>
          <a href="https://www.3dprintlog.com/api-keys" target="_blank" rel="noopener noreferrer" style={s.footerLink}>Get API Key</a>
          <a href="https://github.com/bustrama/3dprintlog-mcp" target="_blank" rel="noopener noreferrer" style={s.footerLink}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: "📋", title: "Print logging", body: "Log new prints, track success/failure, record time and material used." },
  { icon: "🧵", title: "Filament inventory", body: "See what's left on every spool. Add new filaments, update weights after a print." },
  { icon: "🖨️", title: "Printer management", body: "List all your printers, add new ones, track which printer ran which job." },
  { icon: "🔧", title: "Maintenance tracking", body: "Log nozzle changes, bed levelling, lubrication. Never forget a service task." },
  { icon: "🔔", title: "Notifications", body: "Check unread notifications and mark them read without leaving your chat." },
  { icon: "📊", title: "Activity feed", body: "Get a summary of recent activity across all your printers and filaments." },
];

const prompts = [
  "Log a Benchy print — 2h 15m, 18g of eSUN PLA+ Black, success",
  "How much filament do I have left in total?",
  "When did I last do maintenance on my Bambu X1C?",
  "Show me all prints that failed this month",
  "Add a new spool — Polymaker PLA Muted White 1kg",
  "What have I been printing lately?",
];

const s: Record<string, React.CSSProperties> = {
  root: { background: "#0a0a0a", color: "#f0f0f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: "100vh" },

  // nav
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid #1a1a1a", position: "sticky", top: 0, background: "#0a0a0aee", backdropFilter: "blur(8px)", zIndex: 10 },
  navLogo: { fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" },
  navLinks: { display: "flex", gap: "8px", alignItems: "center" },
  navLink: { color: "#f0f0f0", textDecoration: "none", fontSize: "13px", fontWeight: 500, padding: "7px 14px", background: "#4a9eff", borderRadius: "7px" },
  navLinkGhost: { color: "#888", textDecoration: "none", fontSize: "13px", padding: "7px 14px", border: "1px solid #2a2a2a", borderRadius: "7px" },

  // hero
  hero: { textAlign: "center", padding: "100px 24px 80px", maxWidth: "720px", margin: "0 auto" },
  badge: { display: "inline-block", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#4a9eff", border: "1px solid #1a3a5c", background: "#0d1f33", padding: "5px 12px", borderRadius: "20px", marginBottom: "28px" },
  heroTitle: { fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-1.5px" },
  heroAccent: { color: "#4a9eff" },
  heroSub: { fontSize: "18px", color: "#888", lineHeight: 1.7, margin: "0 0 40px", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" },
  heroCtas: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  ctaPrimary: { display: "inline-block", padding: "14px 28px", background: "#4a9eff", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px" },
  ctaSecondary: { display: "inline-block", padding: "14px 28px", background: "transparent", color: "#f0f0f0", border: "1px solid #2a2a2a", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "15px" },
  heroHint: { fontSize: "12px", color: "#444", marginTop: "20px" },

  // sections
  section: { padding: "80px 24px", maxWidth: "900px", margin: "0 auto" },
  sectionTitle: { fontSize: "28px", fontWeight: 700, textAlign: "center", margin: "0 0 48px", letterSpacing: "-0.5px" },

  // steps
  steps: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px", margin: "0 auto" },
  step: { display: "flex", gap: "20px", alignItems: "flex-start", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px 24px" },
  stepNum: { width: "32px", height: "32px", minWidth: "32px", background: "#4a9eff", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" },
  stepTitle: { fontWeight: 600, fontSize: "15px", marginBottom: "4px" },
  stepBody: { fontSize: "13px", color: "#777", lineHeight: 1.6 },

  // features grid
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px" },
  cardIcon: { fontSize: "28px", marginBottom: "12px" },
  cardTitle: { fontWeight: 700, fontSize: "15px", marginBottom: "8px" },
  cardBody: { fontSize: "13px", color: "#666", lineHeight: 1.6 },

  // prompts
  prompts: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "620px", margin: "0 auto" },
  prompt: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "14px 18px", fontSize: "14px", color: "#ccc", lineHeight: 1.5 },
  promptQuote: { color: "#4a9eff", fontWeight: 700 },

  // security
  securityBox: { display: "flex", gap: "20px", alignItems: "flex-start", background: "#0d1f33", border: "1px solid #1a3a5c", borderRadius: "14px", padding: "28px 32px", maxWidth: "620px", margin: "0 auto" },
  securityIcon: { fontSize: "28px", minWidth: "28px" },
  securityTitle: { fontWeight: 700, fontSize: "15px", marginBottom: "8px" },
  securityBody: { fontSize: "13px", color: "#7aabdd", lineHeight: 1.7 },

  // footer
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "28px 48px", borderTop: "1px solid #1a1a1a", marginTop: "40px" },
  footerLogo: { fontSize: "14px", fontWeight: 600, color: "#444" },
  footerLinks: { display: "flex", gap: "20px" },
  footerLink: { fontSize: "13px", color: "#555", textDecoration: "none" },
};
