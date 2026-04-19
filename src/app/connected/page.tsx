"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ConnectedContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [copied, setCopied] = useState<string | null>(null);

  // Prefer build-time env var; fall back to current origin at runtime
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const mcpUrl = `${appUrl}/api/mcp`;

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        "3dprintlog": {
          type: "sse",
          url: mcpUrl,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!token) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.error}>No session token found. Please go back and connect again.</p>
          <a href="/" style={styles.link}>← Back</a>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h1 style={styles.title}>Connected!</h1>
        <p style={styles.subtitle}>
          Your 3dprintlog account is linked. Add one of the configs below to Claude.
        </p>

        <Section
          title="Claude Desktop"
          hint="Merge into ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%\Claude\claude_desktop_config.json (Windows)"
          code={mcpConfig}
          onCopy={() => copy(mcpConfig, "desktop")}
          copied={copied === "desktop"}
        />

        <Section
          title="Claude Code (CLI)"
          hint='Merge into ~/.claude/settings.json'
          code={mcpConfig}
          onCopy={() => copy(mcpConfig, "code")}
          copied={copied === "code"}
        />

        <div style={styles.tokenBox}>
          <p style={styles.tokenLabel}>Your session token (keep private)</p>
          <code style={styles.tokenText}>{token.slice(0, 20)}…</code>
          <button style={styles.smallButton} onClick={() => copy(token, "token")}>
            {copied === "token" ? "Copied!" : "Copy full token"}
          </button>
        </div>

        <div style={styles.revokeSection}>
          <p style={styles.hint}>
            To revoke access, send{" "}
            <code style={styles.inlineCode}>DELETE /api/auth/revoke</code> with your bearer token,
            or contact your admin.
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  hint,
  code,
  onCopy,
  copied,
}: {
  title: string;
  hint: string;
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>{title}</span>
        <button style={styles.copyButton} onClick={onCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p style={styles.hint}>{hint}</p>
      <pre style={styles.pre}>{code}</pre>
    </div>
  );
}

export default function ConnectedPage() {
  return (
    <Suspense>
      <ConnectedContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "16px",
    padding: "48px",
    maxWidth: "560px",
    width: "100%",
  },
  successIcon: { fontSize: "40px", marginBottom: "12px", textAlign: "center" as const },
  title: { fontSize: "24px", fontWeight: 700, margin: "0 0 12px", textAlign: "center" as const },
  subtitle: { color: "#888", fontSize: "14px", lineHeight: 1.6, margin: "0 0 32px", textAlign: "center" as const },
  section: {
    background: "#0f0f0f",
    border: "1px solid #222",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "16px",
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  sectionTitle: { fontWeight: 600, fontSize: "14px" },
  copyButton: {
    background: "#4a9eff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  hint: { fontSize: "12px", color: "#555", margin: "0 0 10px", lineHeight: 1.5 },
  pre: {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: "6px",
    padding: "12px",
    fontSize: "11px",
    overflowX: "auto" as const,
    margin: 0,
    color: "#a0c0ff",
    lineHeight: 1.6,
  },
  tokenBox: {
    background: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  tokenLabel: { fontSize: "12px", color: "#666", margin: 0 },
  tokenText: { fontSize: "12px", color: "#888", flex: 1 },
  smallButton: {
    background: "#222",
    color: "#ccc",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "11px",
    cursor: "pointer",
  },
  revokeSection: { marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #222" },
  inlineCode: { background: "#222", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" },
  error: { color: "#f87171", textAlign: "center" as const },
  link: { color: "#4a9eff", display: "block", textAlign: "center" as const, marginTop: "12px" },
};
