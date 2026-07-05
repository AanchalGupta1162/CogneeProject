"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDemoFill = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@smart-ticket.ai");
      setPassword("PRISM123");
    } else {
      setEmail("reporter@smart-ticket.ai");
      setPassword("PRISM123");
    }
  };

  const handleLocalSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email.includes("admin")) {
        localStorage.setItem(
          "smart-ticket-user",
          JSON.stringify({ role: "admin", name: "Admin (General Manager)" })
        );
        router.push("/admin");
      } else {
        localStorage.setItem(
          "smart-ticket-user",
          JSON.stringify({ role: "client", name: "Client Reporter" })
        );
        router.push("/tickets");
      }
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="fade-up"
        style={{ width: "100%", maxWidth: "380px" }}
      >
        {/* Logo mark */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 8px 32px rgba(109,92,255,0.4)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            SmartTicket AI
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{ padding: "28px" }}
        >
          <form onSubmit={handleLocalSignIn}>
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <hr className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: "11px", color: "var(--text-3)", whiteSpace: "nowrap" }}>
              or continue with
            </span>
            <hr className="divider" style={{ flex: 1 }} />
          </div>

          {/* GitHub */}
          <button
            onClick={() => signIn("github", { callbackUrl: "/developer/dashboard" })}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: "100%", padding: "10px", justifyContent: "center" }}
          >
            <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub (Developer)
          </button>
        </div>

        {/* Demo accounts */}
        <div
          className="card-2"
          style={{ marginTop: "12px", padding: "16px" }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "10px",
            }}
          >
            Demo accounts · password: PRISM123
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { type: "admin" as const, id: "EMP_00007", role: "Admin — General Manager" },
              { type: "user" as const, id: "EMP_00001", role: "Reporter — Branch Manager" },
            ].map(({ type, id, role }) => (
              <button
                key={type}
                onClick={() => handleDemoFill(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "var(--border-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <code
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--accent-2)",
                    background: "var(--accent-dim)",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    fontFamily: "monospace",
                    flexShrink: 0,
                  }}
                >
                  {id}
                </code>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
