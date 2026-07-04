"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NotificationToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    // Only show notifications if logged in as a developer
    const storedUser = localStorage.getItem("smart-ticket-user");
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);
    if (user.role !== "developer") return;

    // Simulate polling for new assigned tickets for the demo
    const interval = setInterval(() => {
      // For demonstration, we'll just randomly trigger a notification
      // In a real app, this would poll `GET /developer/notifications`
      const shouldNotify = Math.random() > 0.9;
      if (shouldNotify && !show) {
        setMessage("✨ Ticket #102 was just assigned to you!");
        setShow(true);
        setTimeout(() => setShow(false), 5000); // Hide after 5 seconds
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [show, pathname]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="glass-panel px-6 py-4 rounded-xl flex items-center space-x-4 shadow-2xl border-indigo-500/30 border">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">New Assignment</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
