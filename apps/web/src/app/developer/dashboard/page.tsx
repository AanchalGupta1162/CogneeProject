"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

export default function DeveloperDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const storedUser = localStorage.getItem("smart-ticket-user");
    const localRole = storedUser ? JSON.parse(storedUser).role : null;
    
    // Allow access if logged in via NextAuth or local mock dev auth
    if (!session?.user && localRole !== "developer") {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8000/tickets/", {
      headers: {
        "Authorization": "Bearer mock-token-developer"
      }
    })
      .then(res => res.json())
      .then((data: Ticket[]) => {
        // Filter for demo purposes to show "assigned" tickets
        const assignedTickets = Array.isArray(data) ? data.filter(t => t.assigned_developer_id !== null || t.status === "assigned") : [];
        setTickets(assignedTickets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router, session, status]);

  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-500 bg-orange-100 border-orange-200';
      case 'low': return 'text-blue-500 bg-blue-100 border-blue-200';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
          <svg className="w-8 h-8 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Developer Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Issues autonomously assigned to you by the AI based on your commit history.
        </p>
      </div>

      {loading || status === "loading" ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-panel text-center py-16 rounded-2xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">You have no tickets currently assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {tickets.map(ticket => (
            <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="block group">
              <div className="glass-panel h-full rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                      Assigned to You
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(ticket.severity)}`}>
                      {ticket.severity.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ticket.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">{ticket.description}</p>
                
                <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 transition-colors">
                  View Assignment Evidence
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
