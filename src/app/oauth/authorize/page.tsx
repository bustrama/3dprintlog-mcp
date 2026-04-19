"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthorizeContent() {
  const params = useSearchParams();
  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const state = params.get("state") ?? "";
  const codeChallenge = params.get("code_challenge") ?? "";
  const codeChallengeMethod = params.get("code_challenge_method") ?? "S256";

  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: required params must be present
  if (!redirectUri || !codeChallenge) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.error}>Invalid authorization request — missing required parameters.</p>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          clientId,
          redirectUri,
          state,
          codeChallenge,
          codeChallengeMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      // Redirect back to Claude with the auth code
      window.location.href = data.redirectUrl;
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
        <h1 style={styles.title}>Connect to 3D Print Log</h1>
        <p style={styles.subtitle}>
          Claude is requesting access to your 3dprintlog account. Paste your API key below to
          authorise.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="apiKey">
            3dprintlog API Key
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
            autoFocus
          />
          <p style={styles.hint}>
            Find it at{" "}
            <a
              href="https://www.3dprintlog.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              3dprintlog.com/api-keys
            </a>
          </p>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || !apiKey} style={styles.button}>
            {loading ? "Verifying…" : "Authorise"}
          </button>
        </form>

        <p style={styles.footer}>
          This grants Claude read/write access to your prints, filaments, printers, and maintenance
          logs.
        </p>
      </div>
    </main>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense>
      <AuthorizeContent />
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
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
  },
  logo: { fontSize: "40px", marginBottom: "12px" },
  title: { fontSize: "22px", fontWeight: 700, margin: "0 0 12px" },
  subtitle: { color: "#888", fontSize: "14px", lineHeight: 1.6, margin: "0 0 28px" },
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
    boxSizing: "border-box" as const,
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
    textAlign: "left" as const,
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
  },
  footer: { fontSize: "11px", color: "#444", marginTop: "24px", lineHeight: 1.5 },
};
