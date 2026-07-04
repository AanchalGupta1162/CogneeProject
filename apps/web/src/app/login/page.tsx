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
    // Mock Authentication for Demo Accounts
    setTimeout(() => {
      if (email.includes("admin")) {
        localStorage.setItem("smart-ticket-user", JSON.stringify({ role: "admin", name: "Admin (General Manager)" }));
        router.push("/admin");
      } else {
        localStorage.setItem("smart-ticket-user", JSON.stringify({ role: "client", name: "Client Reporter" }));
        router.push("/tickets");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mr-4 border border-indigo-100 dark:border-indigo-800/50">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Smart Ticket</p>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign in</h1>
            </div>
          </div>

          <form onSubmit={handleLocalSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Employee Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="EMP_00007@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#00529B] hover:bg-[#004080] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00529B] disabled:opacity-50 transition-colors"
            >
              Sign in <span className="ml-2">›</span>
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Demo Accounts (Password: PRISM123)</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDemoFill("admin")}
                className="w-full flex items-center text-left hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors group"
              >
                <span className="inline-block bg-[#E8F0FE] text-[#00529B] font-mono text-xs font-bold px-2 py-1 rounded mr-3 border border-[#00529B]/20">EMP_00007</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">— Admin (Assistant General Manager)</span>
              </button>
              <button
                onClick={() => handleDemoFill("user")}
                className="w-full flex items-center text-left hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors group"
              >
                <span className="inline-block bg-[#E8F0FE] text-[#00529B] font-mono text-xs font-bold px-2 py-1 rounded mr-3 border border-[#00529B]/20">EMP_00001</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">— Reporter (Branch Manager)</span>
              </button>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => signIn("github", { callbackUrl: "/developer/dashboard" })}
              disabled={loading}
              className="w-full group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
            >
              <svg className="h-5 w-5 text-white mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub (Developer)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
