"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [repoName, setRepoName] = useState("Harshavardhan-28/cognee_test");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading

  const [tickets, setTickets] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedDevs, setSelectedDevs] = useState<{ [ticketId: string]: string }>({});

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:8000/tickets/", {
        headers: { Authorization: "Bearer mock-token-admin" },
      });
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await fetch("http://localhost:8000/tickets/developers", {
        headers: { Authorization: "Bearer mock-token-admin" },
      });
      const data = await response.json();
      setDevelopers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch developers", error);
    }
  };

  // ── Role guard ────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("smart-ticket-user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(stored);
    if (user.role !== "admin") {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
    fetchTickets();
    fetchDevelopers();
  }, []);

  const handleApprove = async (ticketId: string) => {
    await fetch(`http://localhost:8000/tickets/${ticketId}/approve`, {
      method: "POST",
      headers: { Authorization: "Bearer mock-token-admin" },
    });
    fetchTickets();
  };

  const handleReject = async (ticketId: string) => {
    await fetch(`http://localhost:8000/tickets/${ticketId}/reject`, {
      method: "POST",
      headers: { Authorization: "Bearer mock-token-admin" },
    });
    fetchTickets();
  };

  const handleAssign = async (ticketId: string, developerId: string) => {
    if (!developerId) return;
    await fetch(`http://localhost:8000/tickets/${ticketId}/assign`, {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-token-admin",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ developer_id: developerId }),
    });
    fetchTickets();
  };

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch(
        `http://localhost:8000/repositories/${repoName}/sync`,
        { method: "POST" }
      );
      const data = await response.json();
      setSyncResult(data.message || "Sync triggered successfully!");
    } catch {
      setSyncResult("Failed to trigger sync. Make sure API is running.");
    } finally {
      setSyncing(false);
    }
  };

  const pendingTickets = tickets.filter(
    (t) => t.status === "pending_approval" || t.status === "triage"
  );

  // Loading state
  if (isAdmin === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "240px" }}>
        <div className="spinner" />
      </div>
    );
  }

  // Access denied
  if (isAdmin === false) {
    return (
      <div
        className="fade-up"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "320px",
          textAlign: "center",
          paddingTop: "48px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-3)", margin: "0 0 24px", maxWidth: "320px", lineHeight: 1.6 }}>
          This page is only available to administrators. Contact your admin if you need access.
        </p>
        <a href="/tickets" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          Back to Tickets
        </a>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ paddingTop: "32px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          Admin Setup
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
          Manage repositories, sync historical data, and monitor system integrations
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Pending Assignments */}
        <div className="card" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Pending Assignments
            </h2>
            {pendingTickets.length > 0 && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "rgba(245,158,11,0.15)",
                  color: "#fbbf24",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "999px",
                  padding: "1px 8px",
                }}
              >
                {pendingTickets.length}
              </span>
            )}
          </div>

          {pendingTickets.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: "13px",
                background: "var(--surface-2)",
                borderRadius: "8px",
              }}
            >
              No tickets pending approval or triage
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pendingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="card-2"
                  style={{ padding: "14px 16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "var(--text)",
                          margin: "0 0 4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ticket.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "10px",
                            color: "var(--text-3)",
                            fontFamily: "monospace",
                          }}
                        >
                          {ticket.id.substring(0, 8)}
                        </code>
                        <span
                          className={`badge ${ticket.status === "triage" ? "badge-triage" : "badge-pending"}`}
                        >
                          {ticket.status === "triage"
                            ? "Triage"
                            : "Pending Approval"}
                        </span>
                        {ticket.status === "pending_approval" &&
                          ticket.assigned_developer_name && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-2)",
                              }}
                            >
                              AI → {ticket.assigned_developer_name}
                            </span>
                          )}
                      </div>

                      {/* Manual assign */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        <select
                          value={
                            selectedDevs[ticket.id] ||
                            ticket.assigned_developer_id ||
                            ""
                          }
                          onChange={(e) =>
                            setSelectedDevs((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                          className="input"
                          style={{
                            width: "auto",
                            fontSize: "12px",
                            padding: "6px 10px",
                          }}
                        >
                          <option value="">Select developer</option>
                          {developers.map((dev) => (
                            <option key={dev.id} value={dev.id}>
                              {dev.name} ({dev.github_username})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            handleAssign(
                              ticket.id,
                              selectedDevs[ticket.id] ||
                                ticket.assigned_developer_id ||
                                ""
                            )
                          }
                          disabled={
                            !(
                              selectedDevs[ticket.id] ||
                              ticket.assigned_developer_id
                            )
                          }
                          className="btn btn-primary"
                          style={{ padding: "6px 14px", fontSize: "12px" }}
                        >
                          Assign
                        </button>
                      </div>
                    </div>

                    {ticket.status === "pending_approval" && (
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button
                          onClick={() => handleApprove(ticket.id)}
                          className="btn btn-success"
                          style={{ padding: "6px 14px", fontSize: "12px" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(ticket.id)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "12px" }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row: Sync + Webhook */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Historical Sync */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
                Historical Repo Sync
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-3)", margin: "0 0 18px", lineHeight: 1.6 }}>
              Ingest past commits and PRs to build the Cognee knowledge graph before real-time webhooks take over.
            </p>

            <label className="label" htmlFor="repo">Repository (owner/repo)</label>
            <input
              type="text"
              id="repo"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="input"
              style={{ marginBottom: "12px" }}
            />

            <button
              onClick={triggerSync}
              disabled={syncing}
              className="btn btn-primary"
              style={{ width: "100%", padding: "10px" }}
            >
              {syncing ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Syncing…
                </span>
              ) : (
                "Trigger Sync"
              )}
            </button>

            {syncResult && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(109,92,255,0.25)",
                  fontSize: "12px",
                  color: "var(--accent-2)",
                }}
              >
                {syncResult}
              </div>
            )}
          </div>

          {/* Webhook Config */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
                Webhook Configuration
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-3)", margin: "0 0 18px", lineHeight: 1.6 }}>
              Add this URL to your GitHub repository settings to enable real-time autonomous ticket assignment.
            </p>

            <div className="code-block" style={{ marginBottom: "18px" }}>
              https://dayle-pecuniary-inappreciatively.ngrok-free.dev/webhooks/github/Harshavardhan-28/cognee_test
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Set Payload URL to the link above",
                "Set Content-Type to application/json",
                'Select "Just the push event"',
              ].map((step) => (
                <div
                  key={step}
                  style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
