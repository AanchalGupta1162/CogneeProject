"use client";

import { useEffect, useState } from "react";
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
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/tickets/", {
      headers: {
        "Authorization": "Bearer mock-token-client"
      }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-green-100 text-green-800 border-green-200';
      case 'triage': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Active Tickets</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and track issues across your organization.</p>
        </div>
        <Link 
          href="/tickets/new" 
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
        >
          Report Issue
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tickets</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new issue.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-panel group rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className={`flex items-center text-xs font-semibold ${getSeverityColor(ticket.severity)}`}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {ticket.severity.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{ticket.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{ticket.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                {ticket.assigned_developer_id ? (
                  <span className="flex items-center text-indigo-500">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-1">A</div>
                    Assigned
                  </span>
                ) : (
                  <span>Unassigned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
