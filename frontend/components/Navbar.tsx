"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const script = { fontFamily: "'Cormorant Garamond', serif" };

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/notes", label: "Notes" },
    { href: "/chat", label: "Chat" },
    { href: "/summary", label: "Summary" },
  ];

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(4,4,14,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 28px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo — calligraphic, no icon */}
          <Link href={user ? "/dashboard" : "/"} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              style={{ position: "relative" }}
            >
              <span style={{
                ...script,
                fontSize: "28px",
                fontWeight: 400,
                fontStyle: "italic",
                letterSpacing: "0.04em",
                background: scrolled
                  ? "linear-gradient(135deg, #c4b5fd 0%, #93c5fd 60%, #6ee7b7 100%)"
                  : "linear-gradient(135deg, #e2d9ff 0%, #bfdbfe 60%, #a7f3d0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transition: "all 0.3s",
              }}>
                MentorAI
              </span>
              {/* Subtle underline that appears on hover */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", bottom: "-2px", left: "5%", right: "5%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.4), transparent)", transformOrigin: "left" }}
              />
            </motion.div>
          </Link>

          {/* Desktop nav */}
          {!isAuthPage && user && (
            <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      textDecoration: "none",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: active ? 600 : 500,
                      ...jakarta,
                      color: active ? "#ffffff" : "#6868a0",
                      background: active ? "rgba(139,92,246,0.12)" : "transparent",
                      border: active ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#d0d0ff";
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#6868a0";
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }
                    }}
                  >
                    {link.label}
                    {/* Active dot indicator */}
                    {active && (
                      <motion.span
                        layoutId="activeNav"
                        style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#818cf8", display: "block" }}
                      />
                    )}
                  </Link>
                );
              })}

              <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)", margin: "0 10px" }} />

              <button
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 18px", borderRadius: "10px", background: "transparent", border: "1px solid transparent", cursor: "pointer", color: "#6868a0", ...jakarta, fontSize: "14px", fontWeight: 500, transition: "all 0.2s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.15)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#6868a0";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </nav>
          )}

          {/* Mobile toggle */}
          {!isAuthPage && user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{ display: "none", padding: "8px", background: "none", border: "none", cursor: "pointer", color: "#6868a0" }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && !isAuthPage && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", top: "68px", left: 0, right: 0, zIndex: 49, background: "rgba(4,4,14,0.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px 16px" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "12px 16px", borderRadius: "10px", textDecoration: "none", ...jakarta, fontSize: "15px", fontWeight: 500, color: pathname === link.href ? "#ffffff" : "#6868a0", background: pathname === link.href ? "rgba(139,92,246,0.1)" : "transparent", marginBottom: "4px" }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "10px", background: "none", border: "none", cursor: "pointer", ...jakarta, fontSize: "15px", color: "#f87171", marginTop: "4px" }}
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
