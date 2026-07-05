"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function TicketDetailView() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/tickets/${params.id}`, {
      headers: {
        "Authorization": "Bearer mock-token-developer"
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => setTicket(data))
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleCloseTicket = async () => {
    try {
      const res = await fetch(`http://localhost:8000/tickets/${params.id}/close`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer mock-token-developer"
        }
      });
      if (res.ok) {
        setTicket((prev) => prev ? { ...prev, status: "closed" } : null);
      } else {
        console.error("Failed to close ticket");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ticket) return null;

  const recommendation = ticket.recommendations && ticket.recommendations.length > 0 
    ? ticket.recommendations[0] 
    : null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Ticket #{ticket.id.substring(0, 8)}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
              {ticket.status.toUpperCase()}
            </span>
            {ticket.status !== 'closed' && (
              <button 
                type="button"
                onClick={handleCloseTicket}
                className="ml-4 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors border border-red-200"
              >
                Close Ticket
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Created on {new Date(ticket.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Ticket Details Panel */}
        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{ticket.title}</h3>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p>{ticket.description}</p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex items-center space-x-6 text-sm">
            <div>
              <span className="block text-gray-500">Repository</span>
              <span className="font-medium text-gray-900 dark:text-white">{ticket.repository_id}</span>
            </div>
            <div>
              <span className="block text-gray-500">Severity</span>
              <span className="font-medium text-gray-900 dark:text-white">{ticket.severity.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* AI Assignment Evidence Panel */}
        {recommendation ? (
          <div className="glass-panel p-8 rounded-2xl border-2 border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            
            <div className="flex items-center space-x-2 mb-6">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                AI Assignment Reasoning
              </h3>
              <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {recommendation.confidence_score}% Confidence
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Why was this assigned to you?</h4>
              <p className="text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/5">
                {recommendation.reasoning}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Supporting Evidence (Graph Context)</h4>
              <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner border border-gray-800">
                {JSON.stringify(recommendation.evidence, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl text-center text-gray-500">
            AI is still analyzing this ticket to determine the best assignee...
          </div>
        )}
      </div>
    </div>
  );
}
