"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(`/connected?token=${encodeURIComponent(data.token)}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.logo}>🖨️</div>
        <h1 style={styles.title}>3D Print Log MCP</h1>
        <p style={styles.subtitle}>
          Connect Claude to your 3dprintlog account to manage prints, filaments, and printers
          directly from your AI assistant.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="apiKey">
            Your 3dprintlog API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your API key here"
            required
            style={styles.input}
            autoComplete="off"
          />
          <p style={styles.hint}>
            Find your API key at{" "}
            <a href="https://www.3dprintlog.com/api-keys" target="_blank" rel="noopener noreferrer" style={styles.link}>
              3dprintlog.com/api-keys
            </a>
          </p>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || !apiKey} style={styles.button}>
            {loading ? "Verifying…" : "Connect"}
          </button>
        </form>

        <div style={styles.features}>
          <div style={styles.feature}>📋 Manage print jobs</div>
          <div style={styles.feature}>🧵 Track filament inventory</div>
          <div style={styles.feature}>🖨️ Monitor printers</div>
          <div style={styles.feature}>🔧 Log maintenance</div>
        </div>
      </div>
    </main>
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
    maxWidth: "440px",
    width: "100%",
    textAlign: "center",
  },
  logo: { fontSize: "48px", marginBottom: "16px" },
  title: { fontSize: "24px", fontWeight: 700, margin: "0 0 12px" },
  subtitle: { color: "#888", fontSize: "14px", lineHeight: 1.6, margin: "0 0 32px" },
  form: { textAlign: "left" },
  label: { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "#ccc" },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#0f0f0f",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#f0f0f0",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  hint: { fontSize: "12px", color: "#666", margin: "8px 0 0" },
  link: { color: "#4a9eff", textDecoration: "none" },
  error: {
    background: "#2a1010",
    border: "1px solid #5a2020",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#f87171",
    marginTop: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4a9eff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "20px",
    opacity: 1,
  },
  features: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "32px",
  },
  feature: {
    background: "#0f0f0f",
    border: "1px solid #222",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#888",
    textAlign: "left",
  },
};
