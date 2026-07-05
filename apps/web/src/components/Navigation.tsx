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
    const storedUser = localStorage.getItem("smart-ticket-user");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, [pathname]);

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

  if (pathname === "/login") return null;

  const links =
    userRole === "developer"
      ? [{ href: "/developer/dashboard", label: "My Dashboard" }]
      : userRole === "admin"
      ? [
          { href: "/tickets", label: "Tickets" },
          { href: "/tickets/new", label: "Report Issue" },
          { href: "/admin", label: "Admin" },
        ]
      : [
          // client / reporter — no admin access
          { href: "/tickets", label: "Tickets" },
          { href: "/tickets/new", label: "Report Issue" },
        ];

  return (
    <header
      style={{
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link
            href="/"
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text)",
              textDecoration: "none",
              marginRight: "16px",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </span>
            SmartTicket
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {links.map(({ href, label }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link${isActive ? " active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: User */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session || localUser ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                  />
                ) : (
                  <div className="avatar">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-2)",
                    fontWeight: 500,
                  }}
                >
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ padding: "5px 10px", fontSize: "13px" }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: "6px 14px" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
