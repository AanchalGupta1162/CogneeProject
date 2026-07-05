"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface AssignmentResult {
  recommended_developer_id: string;
  confidence_score: number;
  reasoning: string;
  evidence: any;
}

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  repository_id: string;
  assigned_developer_id: string | null;
  recommendations: AssignmentResult[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "open"
      ? "badge-open"
      : s === "assigned"
      ? "badge-assigned"
      : s === "triage"
      ? "badge-triage"
      : s === "solved"
      ? "badge-assigned" // reuse green style
      : s === "closed"
      ? "badge-closed"
      : "badge-pending";
  return (
    <span className={`badge ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function TicketDetailView() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  // GitHub login used to match against assigned_developer_id
  const [githubLogin, setGithubLogin] = useState<string | null>(null);

  useEffect(() => {
    // Local mock auth (admin / client)
    const stored = localStorage.getItem("smart-ticket-user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserRole(user.role);
    }
    // NextAuth GitHub developer
    if (session?.user) {
      setUserRole("developer");
      // session.user.name is the GitHub display name; email prefix is a fallback id
      const login =
        (session.user as any).login ||
        session.user.email?.split("@")[0] ||
        session.user.name ||
        null;
      setGithubLogin(login);
    }

    fetch(`http://localhost:8000/tickets/${params.id}`, {
      headers: { Authorization: "Bearer mock-token-developer" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setTicket(data))
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [params.id, router, session]);

  const handleCloseTicket = async () => {
    try {
      const res = await fetch(`http://localhost:8000/tickets/${params.id}/close`, {
        method: "POST",
        headers: { Authorization: "Bearer mock-token-developer" },
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, status: "closed" } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSolveTicket = async () => {
    try {
      const res = await fetch(`http://localhost:8000/tickets/${params.id}/solve`, {
        method: "POST",
        headers: { Authorization: "Bearer mock-token-developer" },
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, status: "solved" } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  /** Whether the current user can close this ticket (admin: any; developer: assigned only) */
  const isResolved = (t: TicketDetail) =>
    t.status === "closed" || t.status === "solved";

  const isAssignedToMe = (t: TicketDetail): boolean => {
    if (!t.assigned_developer_id) return false;
    if (githubLogin) {
      return (
        t.assigned_developer_id === githubLogin ||
        t.assigned_developer_id.toLowerCase().includes(githubLogin.toLowerCase())
      );
    }
    return true; // mock fallback
  };

  const canClose = (t: TicketDetail): boolean => {
    if (isResolved(t)) return false;
    if (userRole === "admin") return true;
    if (userRole === "developer") return isAssignedToMe(t);
    return false;
  };

  const canSolve = (t: TicketDetail): boolean => {
    if (isResolved(t)) return false;
    if (userRole === "developer") return isAssignedToMe(t);
    return false; // admins use Close; clients can't
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "240px",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!ticket) return null;

  const recommendation =
    ticket.recommendations && ticket.recommendations.length > 0
      ? ticket.recommendations[0]
      : null;

  return (
    <div className="fade-up" style={{ maxWidth: "760px", margin: "0 auto", paddingTop: "32px" }}>
      {/* Breadcrumb + Back */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-2)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <code
            style={{
              fontSize: "12px",
              color: "var(--text-3)",
              fontFamily: "monospace",
            }}
          >
            #{ticket.id.substring(0, 8)}
          </code>
          <StatusBadge status={ticket.status} />
          {canSolve(ticket) && (
            <button
              onClick={handleSolveTicket}
              className="btn btn-success"
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark as Solved
            </button>
          )}
          {canClose(ticket) && (
            <button onClick={handleCloseTicket} className="btn btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }}>
              Close
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Main detail card */}
        <div className="card" style={{ padding: "24px" }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
              lineHeight: 1.35,
            }}
          >
            {ticket.title}
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              lineHeight: 1.7,
              margin: "0 0 20px",
              whiteSpace: "pre-wrap",
            }}
          >
            {ticket.description}
          </p>

          <hr className="divider" style={{ marginBottom: "16px" }} />

          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            {[
              { label: "Repository", value: ticket.repository_id },
              {
                label: "Severity",
                value: ticket.severity.toUpperCase(),
                className:
                  ticket.severity === "high"
                    ? "sev-high"
                    : ticket.severity === "medium"
                    ? "sev-medium"
                    : ticket.severity === "critical"
                    ? "sev-critical"
                    : "sev-low",
              },
              {
                label: "Created",
                value: new Date(ticket.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ].map(({ label, value, className }) => (
              <div key={label}>
                <p style={{ fontSize: "11px", color: "var(--text-3)", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  {label}
                </p>
                <p className={className} style={{ fontSize: "13px", color: className ? undefined : "var(--text)", margin: 0, fontWeight: 500 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning card */}
        {recommendation ? (
          <div className="card" style={{ padding: "24px", borderColor: "rgba(109,92,255,0.25)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "var(--accent-dim)",
                    border: "1px solid rgba(109,92,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  AI Assignment Reasoning
                </h2>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent-2)",
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(109,92,255,0.25)",
                  borderRadius: "999px",
                  padding: "3px 10px",
                }}
              >
                {recommendation.confidence_score}% confidence
              </span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Reasoning
              </p>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "var(--text-2)",
                  lineHeight: 1.7,
                  margin: 0,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                {recommendation.reasoning}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Graph Evidence
              </p>
              <pre className="code-block">
                {JSON.stringify(recommendation.evidence, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: "13px",
            }}
          >
            AI is analyzing this ticket to determine the best assignee…
          </div>
        )}
      </div>
    </div>
  );
}
