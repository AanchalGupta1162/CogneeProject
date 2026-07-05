"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  repository_id: string;
  assigned_developer_id: string | null;
  assigned_developer_name?: string | null;
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
      : s === "pending_approval"
      ? "badge-pending"
      : s === "solved"
      ? "badge-assigned" // green — resolved by developer
      : "badge-closed";

  const label =
    s === "pending_approval"
      ? "Pending"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return <span className={`badge ${cls}`}>{label}</span>;
}

function SeverityDot({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const cls =
    s === "high"
      ? "sev-high"
      : s === "medium"
      ? "sev-medium"
      : s === "critical"
      ? "sev-critical"
      : "sev-low";
  return (
    <span className={cls} style={{ fontWeight: 600, fontSize: "12px" }}>
      {severity.toUpperCase()}
    </span>
  );
}

export default function TicketList() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    fetch("http://localhost:8000/tickets/", {
      headers: { Authorization: "Bearer mock-token-client" },
    })
      .then((res) => res.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const isActive = ticket.status !== "closed";
    const matchesTab = activeTab === "active" ? isActive : !isActive;
    const matchesSeverity =
      severityFilter === "all" ||
      ticket.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesTab && matchesSeverity;
  });

  return (
    <div className="fade-up">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          paddingTop: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Tickets
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
            Track and manage issues across your organization
          </p>
        </div>
        <Link href="/tickets/new" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Issue
        </Link>
      </div>

      {/* Filters bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "3px",
          }}
        >
          {(["active", "closed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "5px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: activeTab === tab ? "var(--surface-2)" : "transparent",
                color: activeTab === tab ? "var(--text)" : "var(--text-3)",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Severity</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input"
            style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <div className="spinner" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 12px" }}
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ color: "var(--text-2)", fontSize: "14px", fontWeight: 500, margin: "0 0 4px" }}>
            No {activeTab} tickets
          </p>
          <p style={{ color: "var(--text-3)", fontSize: "13px", margin: 0 }}>
            {activeTab === "active"
              ? "Create a new issue to get started."
              : "No closed tickets yet."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 130px 120px",
              padding: "10px 20px",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Title</span>
            <span>Status</span>
            <span>Severity</span>
            <span>Assignee</span>
            <span>Created</span>
          </div>

          {/* Table rows */}
          {filteredTickets.map((ticket, i) => (
            <div
              key={ticket.id}
              onClick={() => router.push(`/tickets/${ticket.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px 100px 130px 120px",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom:
                  i < filteredTickets.length - 1 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ paddingRight: "16px", minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "var(--text)",
                    margin: "0 0 2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.title}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-3)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.repository_id}
                </p>
              </div>
              <div>
                <StatusBadge status={ticket.status} />
              </div>
              <div>
                <SeverityDot severity={ticket.severity} />
              </div>
              <div>
                {ticket.assigned_developer_name ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div className="avatar" style={{ width: 20, height: 20, fontSize: "9px" }}>
                      {ticket.assigned_developer_name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.assigned_developer_name}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-3)" }}>—</span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
