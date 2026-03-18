"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Zap, LogOut, Menu, X } from "lucide-react";

const syne = { fontFamily: "'Syne', sans-serif" };

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    logout(); // clears localStorage token
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/notes", label: "Notes" },
    { href: "/chat", label: "Chat" },
    { href: "/summary", label: "Summary" },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "all 0.3s",
      background: scrolled ? "rgba(3,3,8,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={15} style={{ color: "#00d4ff" }} fill="#00d4ff" />
          </div>
          <span style={{ ...syne, fontWeight: 700, fontSize: "16px" }}>
            <span style={{ color: "#ffffff" }}>Mentor</span>
            <span style={{ color: "#00d4ff" }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {!isAuthPage && user && (
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  ...syne,
                  color: pathname === link.href ? "#00d4ff" : "#8888aa",
                  background: pathname === link.href ? "rgba(0,212,255,0.08)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "transparent", border: "none", cursor: "pointer", color: "#8888aa", ...syne, fontSize: "13px", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#8888aa"; }}
            >
              <LogOut size={14} /> Logout
            </button>
          </nav>
        )}

        {/* Mobile toggle */}
        {!isAuthPage && user && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none", padding: "8px", background: "none", border: "none", cursor: "pointer", color: "#8888aa" }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}
