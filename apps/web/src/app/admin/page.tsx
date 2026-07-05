"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [repoName, setRepoName] = useState("Harshavardhan-28/cognee_test");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedDevs, setSelectedDevs] = useState<{ [ticketId: string]: string }>({});

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:8000/tickets/", {
        headers: { "Authorization": "Bearer mock-token-admin" }
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
        headers: { "Authorization": "Bearer mock-token-admin" }
      });
      const data = await response.json();
      setDevelopers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch developers", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchDevelopers();
  }, []);

  const handleApprove = async (ticketId: string) => {
    await fetch(`http://localhost:8000/tickets/${ticketId}/approve`, {
      method: "POST",
      headers: { "Authorization": "Bearer mock-token-admin" }
    });
    fetchTickets();
  };

  const handleReject = async (ticketId: string) => {
    await fetch(`http://localhost:8000/tickets/${ticketId}/reject`, {
      method: "POST",
      headers: { "Authorization": "Bearer mock-token-admin" }
    });
    fetchTickets();
  };

  const handleAssign = async (ticketId: string, developerId: string) => {
    if (!developerId) return;
    await fetch(`http://localhost:8000/tickets/${ticketId}/assign`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer mock-token-admin",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ developer_id: developerId })
    });
    fetchTickets();
  };

  const pendingTickets = tickets.filter(t => t.status === "pending_approval" || t.status === "triage");

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch(`http://localhost:8000/repositories/${repoName}/sync`, {
        method: "POST",
      });
      const data = await response.json();
      setSyncResult(data.message || "Sync triggered successfully!");
    } catch (error) {
      setSyncResult("Failed to trigger sync. Make sure API is running.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="border-b border-gray-200 dark:border-white/10 pb-5">
        <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">Admin Setup & Configuration</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
          Manage repositories, sync historical data, and monitor system integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending AI Assignments Panel */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Pending Assignments ({pendingTickets.length})
          </h4>
          
          {pendingTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No tickets are currently pending approval or triage.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTickets.map(ticket => (
                <div key={ticket.id} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/30 dark:bg-black/20">
                  <div className="flex-grow">
                    <h5 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h5>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {ticket.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center flex-wrap gap-2">
                      <span>Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ticket.status === 'triage' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ticket.status === 'triage' ? 'Triage (Needs Assignment)' : 'Pending Approval'}
                      </span>
                      {ticket.status === 'pending_approval' && (
                        <>
                          <span>AI Recommended Assignee:</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {ticket.assigned_developer_name || 'Unknown'}
                          </span>
                        </>
                      )}
                    </p>

                    {/* Manual Assignment Section */}
                    <div className="mt-3 flex items-center space-x-2">
                      <select
                        value={selectedDevs[ticket.id] || ticket.assigned_developer_id || ""}
                        onChange={(e) => setSelectedDevs(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 px-3 py-1.5 shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      >
                        <option value="">-- Select Developer --</option>
                        {developers.map(dev => (
                          <option key={dev.id} value={dev.id}>
                            {dev.name} ({dev.github_username})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(ticket.id, selectedDevs[ticket.id] || ticket.assigned_developer_id || "")}
                        disabled={!(selectedDevs[ticket.id] || ticket.assigned_developer_id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                  
                  {ticket.status === 'pending_approval' && (
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => handleApprove(ticket.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(ticket.id)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Historical Sync Panel */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Historical Repo Sync
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Ingest past commits and pull requests from a GitHub repository to build the Cognee knowledge graph before real-time webhooks take over.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="repo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository (owner/repo)
              </label>
              <input
                type="text"
                id="repo"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {syncing ? "Syncing..." : "Trigger Sync"}
            </button>

            {syncResult && (
              <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm border border-indigo-100 dark:border-indigo-800/50">
                {syncResult}
              </div>
            )}
          </div>
        </div>

        {/* Webhook Configuration Panel */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Webhook Configuration
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Configure this URL in your GitHub repository settings to enable real-time, autonomous ticket assignment and context ingestion.
          </p>

          <div className="bg-gray-100 dark:bg-black/40 rounded-lg p-4 font-mono text-xs text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-white/5 shadow-inner">
            https://dayle-pecuniary-inappreciatively.ngrok-free.dev/webhooks/github/Harshavardhan-28/cognee_test
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
              <span className="ml-2">Set Payload URL to the link above</span>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
              <span className="ml-2">Set Content type to application/json</span>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500">✓</span>
              <span className="ml-2">Select "Just the push event"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
