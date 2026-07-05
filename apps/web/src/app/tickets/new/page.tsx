"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low", color: "var(--sev-low, #60a5fa)" },
  { value: "medium", label: "Medium", color: "#fb923c" },
  { value: "high", label: "High", color: "#f87171" },
  { value: "critical", label: "Critical", color: "#e879f9" },
];

export default function NewTicket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repository_id: "Harshavardhan-28/cognee_test",
    severity: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/tickets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token-client",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create ticket");
      router.push("/tickets");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <Link
          href="/tickets"
          style={{
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            color: "var(--text-2)",
            textDecoration: "none",
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
        </Link>
        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 2px",
              letterSpacing: "-0.02em",
            }}
          >
            Report an Issue
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>
            Describe the bug or feature request in detail
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="card" style={{ padding: "28px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Title */}
          <div>
            <label className="label" htmlFor="title">
              Title <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g. Memory leak in Webhooks processor"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="description">
              Description <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Steps to reproduce, expected behavior, and actual behavior..."
              style={{ resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          {/* Repository + Severity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="label" htmlFor="repository_id">
                Repository
              </label>
              <input
                id="repository_id"
                type="text"
                required
                value={formData.repository_id}
                onChange={(e) => setFormData({ ...formData, repository_id: e.target.value })}
                className="input"
                style={{ background: "var(--surface)" }}
              />
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "5px" }}>
                Where the issue occurred
              </p>
            </div>

            <div>
              <label className="label" htmlFor="severity">
                Severity
              </label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="input"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "4px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/tickets")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Submitting...
                </span>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
