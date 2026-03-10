"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Zap, LogOut, Menu, X } from "lucide-react";

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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/notes", label: "Notes" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#020206]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center group-hover:bg-[#00d4ff]/20 transition-all group-hover:shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            <Zap size={16} className="text-[#00d4ff]" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            <span className="text-white">Mentor</span>
            <span className="text-[#00d4ff]">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {!isAuthPage && user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-display tracking-wide ${
                  pathname === link.href
                    ? "text-[#00d4ff] bg-[#00d4ff]/8"
                    : "text-[#8888aa] hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00d4ff]" />
                )}
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-white/10 mx-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8888aa] hover:text-red-400 hover:bg-red-500/5 transition-all font-display"
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
            className="md:hidden p-2 text-[#8888aa] hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && !isAuthPage && user && (
        <div className="md:hidden bg-[#08080f]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-display font-medium transition-all ${
                pathname === link.href
                  ? "text-[#00d4ff] bg-[#00d4ff]/8"
                  : "text-[#8888aa] hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-sm font-display text-red-400 hover:bg-red-500/5 transition-all"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
