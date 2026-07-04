"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [localUser, setLocalUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    // Check local storage for mock auth
    const storedUser = localStorage.getItem("smart-ticket-user");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, [pathname]);

  // Combine NextAuth session with local mock session
  const userRole = session?.user ? "developer" : localUser?.role;
  const userName = session?.user?.name || localUser?.name;

  const handleLogout = async () => {
    localStorage.removeItem("smart-ticket-user");
    setLocalUser(null);
    if (session) {
      await signOut({ redirect: false });
    }
    router.push("/login");
  };

  if (pathname === "/login") return null; // Don't show nav on login page

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8 mb-8 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            SmartTicket AI
          </Link>
          
          <div className="hidden sm:flex space-x-4">
            {userRole === "developer" ? (
              <Link 
                href="/developer/dashboard"
                className={`text-sm font-medium transition-colors hover:text-indigo-500 ${pathname.includes('/developer') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/tickets"
                  className={`text-sm font-medium transition-colors hover:text-indigo-500 ${pathname === '/tickets' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  All Tickets
                </Link>
                <Link 
                  href="/tickets/new"
                  className={`text-sm font-medium transition-colors hover:text-indigo-500 ${pathname === '/tickets/new' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Report Issue
                </Link>
                <Link 
                  href="/admin"
                  className={`text-sm font-medium transition-colors hover:text-indigo-500 ${pathname === '/admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Admin Setup
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {(session || localUser) ? (
            <>
              <div className="flex items-center space-x-2">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full shadow-lg" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {userName ? userName.charAt(0) : "U"}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-300">{userName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
